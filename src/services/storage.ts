import * as SQLite from "expo-sqlite";


const creationStatements: Record<string, string> = {
  profile: `
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
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
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
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
  const db = await SQLite.openDatabaseAsync("rolodex.db");

  for (const statement of Object.values(creationStatements)) {
    try {
      await db.execAsync(statement);
    } catch (e) {
      console.error("Error creating table:", e);
    }
  }

  return db;
}

// ============================================================================
// Profile Operations
// ============================================================================

async function upsertProfile(
  db: SQLite.SQLiteDatabase,
  id: string,
  displayName: string,
  createdAt?: number
): Promise<void> {
  const timestamp = createdAt || Date.now();
  await db.runAsync(
    `INSERT INTO profile (id, display_name, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name`,
    [id, displayName, timestamp]
  );
}

async function getProfile(db: SQLite.SQLiteDatabase, id: string) {
  return await db.getFirstAsync(
    "SELECT * FROM profile WHERE id = ?",
    [id]
  );
}

async function deleteProfile(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM profile WHERE id = ?", [id]);
}

// ============================================================================
// Profile Fields Operations
// ============================================================================

async function upsertProfileField(
  db: SQLite.SQLiteDatabase,
  id: string,
  profileId: string,
  label: string,
  value: string,
  shareByDefault: boolean
): Promise<void> {
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

async function getProfileFields(db: SQLite.SQLiteDatabase, profileId: string) {
  return await db.getAllAsync(
    "SELECT * FROM profile_fields WHERE profile_id = ?",
    [profileId]
  );
}

async function deleteProfileField(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM profile_fields WHERE id = ?", [id]);
}

// ============================================================================
// Mask Operations
// ============================================================================

async function upsertMask(
  db: SQLite.SQLiteDatabase,
  id: string,
  profileId: string,
  name: string,
  createdAt?: number
): Promise<void> {
  const timestamp = createdAt || Date.now();
  await db.runAsync(
    `INSERT INTO masks (id, profile_id, name, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name = excluded.name`,
    [id, profileId, name, timestamp]
  );
}

async function getMasks(db: SQLite.SQLiteDatabase, profileId: string) {
  return await db.getAllAsync(
    "SELECT * FROM masks WHERE profile_id = ?",
    [profileId]
  );
}

async function deleteMask(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM masks WHERE id = ?", [id]);
}

// ============================================================================
// Mask Fields Operations
// ============================================================================

async function setMaskFields(
  db: SQLite.SQLiteDatabase,
  maskId: string,
  profileFieldIds: string[]
): Promise<void> {
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

async function getMaskFields(db: SQLite.SQLiteDatabase, maskId: string) {
  return await db.getAllAsync(
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
  db: SQLite.SQLiteDatabase,
  id: string,
  issuer: string,
  displayName: string,
  rawPayload: string,
  connectedAt?: number
): Promise<void> {
  const timestamp = connectedAt || Date.now();
  await db.runAsync(
    `INSERT INTO connections (id, connected_at, issuer, display_name, raw_payload)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       raw_payload = excluded.raw_payload`,
    [id, timestamp, issuer, displayName, rawPayload]
  );
}

async function getConnection(db: SQLite.SQLiteDatabase, id: string) {
  return await db.getFirstAsync(
    "SELECT * FROM connections WHERE id = ?",
    [id]
  );
}

async function getAllConnections(db: SQLite.SQLiteDatabase) {
  return await db.getAllAsync("SELECT * FROM connections ORDER BY connected_at DESC");
}

async function deleteConnection(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM connections WHERE id = ?", [id]);
}

// ============================================================================
// Connection Fields Operations
// ============================================================================

async function upsertConnectionField(
  db: SQLite.SQLiteDatabase,
  id: string,
  connectionId: string,
  label: string,
  value: string
): Promise<void> {
  await db.runAsync(
    `INSERT INTO connection_fields (id, connection_id, label, value)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       label = excluded.label,
       value = excluded.value`,
    [id, connectionId, label, value]
  );
}

async function getConnectionFields(db: SQLite.SQLiteDatabase, connectionId: string) {
  return await db.getAllAsync(
    "SELECT * FROM connection_fields WHERE connection_id = ?",
    [connectionId]
  );
}

async function deleteConnectionField(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM connection_fields WHERE id = ?", [id]);
}

// ============================================================================
// Annotation Operations
// ============================================================================

async function upsertAnnotation(
  db: SQLite.SQLiteDatabase,
  id: string,
  connectionId: string,
  type: string,
  label: string,
  value: string,
  createdAt?: number
): Promise<void> {
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

async function getAnnotations(db: SQLite.SQLiteDatabase, connectionId: string) {
  return await db.getAllAsync(
    "SELECT * FROM annotations WHERE connection_id = ? ORDER BY created_at DESC",
    [connectionId]
  );
}

async function deleteAnnotation(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync("DELETE FROM annotations WHERE id = ?", [id]);
}

export {
  initDatabase,
  // Profile
  upsertProfile,
  getProfile,
  deleteProfile,
  // Profile Fields
  upsertProfileField,
  getProfileFields,
  deleteProfileField,
  // Masks
  upsertMask,
  getMasks,
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