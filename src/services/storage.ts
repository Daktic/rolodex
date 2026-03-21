import * as SQLite from "expo-sqlite";
import type { Profile, ProfileField, Mask, Connection, ConnectionField, Annotation } from "@/types/storage";
import {getProfileId} from "@/services/wallet";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const creationStatements: Record<string, string> = {
  profile: `
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      created_at INTEGER NOT NULL
    )
  `,
  
  profileFields: `
    CREATE TABLE IF NOT EXISTS profile_fields (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      share_by_default INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profile(id)
    )
  `,

  masks: `
    CREATE TABLE IF NOT EXISTS masks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      profile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profile(id)
    )
  `,

  maskFields: `
    CREATE TABLE IF NOT EXISTS mask_fields (
      mask_id TEXT NOT NULL,
      profile_field_id TEXT NOT NULL,
      PRIMARY KEY (mask_id, profile_field_id),
      FOREIGN KEY (mask_id) REFERENCES masks(id),
      FOREIGN KEY (profile_field_id) REFERENCES profile_fields(id)
    )
  `,

  connections: `
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      connected_at INTEGER NOT NULL,
      issuer TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      raw_payload TEXT NOT NULL
    )
  `,

  connectionFields: `
    CREATE TABLE IF NOT EXISTS connection_fields (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      FOREIGN KEY (connection_id) REFERENCES connections(id)
    )
  `,
  
  annotations: `
    CREATE TABLE IF NOT EXISTS annotations (
      id TEXT PRIMARY KEY,
      connection_id TEXT NOT NULL,
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (connection_id) REFERENCES connections(id)
    )
  `
};


async function initDatabase() {
  if (dbInstance) return dbInstance;

  const db = await SQLite.openDatabaseAsync("rolodex.db");

  // Create tables
  for (const statement of Object.values(creationStatements)) {
    try {
      await db.execAsync(statement);
    } catch (e) {
      console.error("Error creating table:", e);
    }
  }

  // Run migrations
  await runMigrations(db);

  dbInstance = db;
  return db;
}

async function runMigrations(db: SQLite.SQLiteDatabase) {
  // Add avatar_uri column if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE profile ADD COLUMN avatar_uri TEXT;
    `);
    console.log("Migration: Added avatar_uri to profile");
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.execAsync(`
      ALTER TABLE connections ADD COLUMN avatar_uri TEXT;
    `);
    console.log("Migration: Added avatar_uri to connections");
  } catch (e) {
    // Column already exists, ignore
  }

  // Migrate masks table to add id column
  try {
    // Check if masks table has id column by trying to select it
    await db.getFirstAsync(`SELECT id FROM masks LIMIT 1`);
    // If no error, id column exists, no migration needed
  } catch (e) {
    // id column doesn't exist, need to migrate
    console.log("Migration: Recreating masks table with id column");

    // Create new table with correct schema
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS masks_new (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        profile_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        FOREIGN KEY (profile_id) REFERENCES profile(id)
      )
    `);

    // Copy data from old table, generating ids
    try {
      const oldMasks = await db.getAllAsync<{name: string, profile_id: string, created_at: number}>(
        `SELECT name, profile_id, created_at FROM masks`
      );

      for (const mask of oldMasks) {
        await db.runAsync(
          `INSERT INTO masks_new (id, name, profile_id, created_at) VALUES (?, ?, ?, ?)`,
          [`mask-${mask.name.toLowerCase()}-${mask.profile_id}`, mask.name, mask.profile_id, mask.created_at]
        );
      }
    } catch (e) {
      console.log("No existing masks to migrate");
    }

    // Drop old table and rename new one
    await db.execAsync(`DROP TABLE IF EXISTS masks`);
    await db.execAsync(`ALTER TABLE masks_new RENAME TO masks`);

    console.log("Migration: Masks table migration complete");
  }
}

function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return dbInstance;
}

// ============================================================================
// Profile Operations
// ============================================================================

async function upsertProfile(
  id: string,
  displayName: string,
  avatarUri?: string | null,
  createdAt?: number
): Promise<void> {
  const db = getDatabase();
  const timestamp = createdAt || Date.now();
  await db.runAsync(
    `INSERT INTO profile (id, display_name, avatar_uri, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      display_name = excluded.display_name,
       avatar_uri = excluded.avatar_uri`,
    [id, displayName, avatarUri?? null, timestamp]
  );
}

async function updateProfileAvatar(id: string, avatarUri: string | null): Promise<void> {
  const db = getDatabase();

  // Check if profile exists
  const existing = await getProfile(id);

  if (existing) {
    // Update existing
    await db.runAsync(
      "UPDATE profile SET avatar_uri = ? WHERE id = ?",
      [avatarUri, id]
    );
  } else {
    // Create new profile with placeholder name
    await upsertProfile(id, "User", avatarUri);
  }
}

async function updateProfileDisplayName(id: string, profileName: string): Promise<void> {
  const db = getDatabase();

  // Check if profile exists
  const existing = await getProfile(id);

  if (existing) {
    // Update existing
    await db.runAsync(
      "UPDATE profile SET display_name = ? WHERE id = ?",
      [profileName, id]
    );
  } else {
    // Create new profile
    await upsertProfile(id, profileName);
  }
}

async function getProfile(id: string): Promise<Profile | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Profile>(
    "SELECT * FROM profile WHERE id = ?",
    [id]
  );
}

async function deleteProfile(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM profile WHERE id = ?", [id]);
}

// ============================================================================
// Profile Fields Operations
// ============================================================================

async function upsertProfileField(
  id: string,
  profileId: string,
  label: string,
  value: string,
  shareByDefault: boolean
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO profile_fields (id, profile_id, label, value, share_by_default)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       value = excluded.value,
       share_by_default = excluded.share_by_default`,
    [id, profileId, label, value, shareByDefault ? 1 : 0]
  );
}

async function getProfileFields(profileId: string): Promise<ProfileField[]> {
  const db = getDatabase();
  return await db.getAllAsync<ProfileField>(
    "SELECT * FROM profile_fields WHERE profile_id = ?",
    [profileId]
  );
}

async function deleteProfileField(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM profile_fields WHERE id = ?", [id]);
}

// ============================================================================
// Mask Operations
// ============================================================================

async function upsertMask(
  name: string,
  profileId: string,
  createdAt?: number
): Promise<void> {
  const db = getDatabase();
  const timestamp = createdAt || Date.now();
  const id = `mask-${name.toLowerCase().replace(/\s+/g, '-')}-${profileId}`;
  console.log("upsertMask: Inserting mask with:", { id, name, profileId, timestamp });
  await db.runAsync(
    `INSERT INTO masks (id, name, profile_id, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET name = excluded.name`,
    [id, name, profileId, timestamp]
  );
  console.log("upsertMask: Insert completed");

  // Verify the mask was inserted
  const verifyMask = await db.getFirstAsync<Mask>(
    "SELECT * FROM masks WHERE id = ?",
    [id]
  );
  console.log("upsertMask: Verification query result:", verifyMask);
}

async function getMasks(profileId: string): Promise<Mask[]> {
  const db = getDatabase();
  console.log("getMasks: Querying masks for profileId:", profileId);
  const masks = await db.getAllAsync<Mask>(
    "SELECT * FROM masks WHERE profile_id = ?",
    [profileId]
  );
  console.log("getMasks: Initial query result:", masks);

  // If no masks exist, create a default "All" mask
  if (masks.length === 0) {
    console.log("getMasks: No masks found, creating default 'All' mask for profile:", profileId);
    try {
      await upsertMask("All", profileId);
      console.log("getMasks: Default mask created successfully");

      // Check all masks in the database
      const allMasks = await db.getAllAsync<Mask>("SELECT * FROM masks");
      console.log("getMasks: ALL masks in database:", allMasks);

      const newMasks = await db.getAllAsync<Mask>(
        "SELECT * FROM masks WHERE profile_id = ?",
        [profileId]
      );
      console.log("getMasks: Fetched masks after creation with profileId filter:", newMasks);
      return newMasks;
    } catch (error) {
      console.error("getMasks: Error creating default mask:", error);
      return [];
    }
  }

  return masks;
}

async function getMask(id: string): Promise<Mask | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Mask>(
    "SELECT * FROM masks WHERE id = ?",
    [id]
  );
}

async function deleteMask(name: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM masks WHERE name = ?", [name]);
}

// ============================================================================
// Mask Fields Operations
// ============================================================================

async function setMaskFields(
  maskId: string,
  profileFieldIds: string[]
): Promise<void> {
  const db = getDatabase();
  // Delete existing associations
  await db.runAsync("DELETE FROM mask_fields WHERE mask_id = ?", [maskId]);

  // Insert new associations
  for (const fieldId of profileFieldIds) {
    await db.runAsync(
      "INSERT INTO mask_fields (mask_id, profile_field_id) VALUES (?, ?)",
      [maskId, fieldId]
    );
  }
}

async function getMaskFields(maskId: string): Promise<ProfileField[]> {
  const db = getDatabase();
  return await db.getAllAsync<ProfileField>(
    `SELECT pf.* FROM profile_fields pf
     JOIN mask_fields mf ON pf.id = mf.profile_field_id
     WHERE mf.mask_id = ?`,
    [maskId]
  );
}

// ============================================================================
// Connection Operations
// ============================================================================

async function upsertConnection(
  id: string,
  issuer: string,
  displayName: string,
  rawPayload: string,
  avatarUri?: string | null,
  connectedAt?: number
): Promise<void> {
  const db = getDatabase();
  const timestamp = connectedAt || Date.now();
  await db.runAsync(
    `INSERT INTO connections (id, connected_at, issuer, display_name, avatar_uri, raw_payload)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       avatar_uri = excluded.avatar_uri,
       raw_payload = excluded.raw_payload`,
    [id, timestamp, issuer, displayName, avatarUri?? null, rawPayload]
  );
}

async function getConnection(id: string): Promise<Connection | null> {
  const db = getDatabase();
  return await db.getFirstAsync<Connection>(
    "SELECT * FROM connections WHERE id = ?",
    [id]
  );
}

async function getAllConnections(): Promise<Connection[]> {
  const db = getDatabase();
  return await db.getAllAsync<Connection>("SELECT * FROM connections ORDER BY connected_at DESC");
}

async function deleteConnection(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM connections WHERE id = ?", [id]);
}

// ============================================================================
// Connection Fields Operations
// ============================================================================

async function upsertConnectionField(
  id: string,
  connectionId: string,
  label: string,
  value: string
): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `INSERT INTO connection_fields (id, connection_id, label, value)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       value = excluded.value`,
    [id, connectionId, label, value]
  );
}

async function getConnectionFields(connectionId: string): Promise<ConnectionField[]> {
  const db = getDatabase();
  return await db.getAllAsync<ConnectionField>(
    "SELECT * FROM connection_fields WHERE connection_id = ?",
    [connectionId]
  );
}

async function deleteConnectionField(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM connection_fields WHERE id = ?", [id]);
}

// ============================================================================
// Annotation Operations
// ============================================================================

async function upsertAnnotation(
  id: string,
  connectionId: string,
  type: string,
  label: string,
  value: string,
  createdAt?: number
): Promise<void> {
  const db = getDatabase();
  const timestamp = createdAt || Date.now();
  await db.runAsync(
    `INSERT INTO annotations (id, connection_id, type, label, value, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       type = excluded.type,
       label = excluded.label,
       value = excluded.value`,
    [id, connectionId, type, label, value, timestamp]
  );
}

async function getAnnotations(connectionId: string): Promise<Annotation[]> {
  const db = getDatabase();
  return await db.getAllAsync<Annotation>(
    "SELECT * FROM annotations WHERE connection_id = ? ORDER BY created_at DESC",
    [connectionId]
  );
}

async function deleteAnnotation(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM annotations WHERE id = ?", [id]);
}

export {
  initDatabase,
  getDatabase,
  // Profile
  upsertProfile,
  updateProfileAvatar,
  updateProfileDisplayName,
  getProfile,
  deleteProfile,
  // Profile Fields
  upsertProfileField,
  getProfileFields,
  deleteProfileField,
  // Masks
  upsertMask,
  getMasks,
  getMask,
  deleteMask,
  // Mask Fields
  setMaskFields,
  getMaskFields,
  // Connections
  upsertConnection,
  getConnection,
  getAllConnections,
  deleteConnection,
  // Connection Fields
  upsertConnectionField,
  getConnectionFields,
  deleteConnectionField,
  // Annotations
  upsertAnnotation,
  getAnnotations,
  deleteAnnotation,
};