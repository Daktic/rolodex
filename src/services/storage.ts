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

export { initDatabase };