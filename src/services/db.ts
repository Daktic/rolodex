import * as SQLite from "expo-sqlite";

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
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    )
  `,

    masks: `
    CREATE TABLE IF NOT EXISTS masks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      profile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    )
  `,

    maskFields: `
    CREATE TABLE IF NOT EXISTS mask_fields (
      mask_id TEXT NOT NULL,
      profile_field_id TEXT NOT NULL,
      PRIMARY KEY (mask_id, profile_field_id),
      FOREIGN KEY (mask_id) REFERENCES masks(id),
      FOREIGN KEY (profile_field_id) REFERENCES profile_fields(id) ON DELETE CASCADE
    )
  `,

    connections: `
    CREATE TABLE IF NOT EXISTS connections (
      id TEXT PRIMARY KEY,
      connected_at INTEGER NOT NULL,
      issuer TEXT,
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
      FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE
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
      FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE
    )
  `
};


export async function initDatabase() {
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
    // When needed
}

export function getDatabase(): SQLite.SQLiteDatabase {
    if (!dbInstance) {
        throw new Error("Database not initialized. Call initDatabase() first.");
    }
    return dbInstance;
}