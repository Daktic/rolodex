import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

const creationStatements: Record<string, string> = {
    profile: `
    CREATE TABLE IF NOT EXISTS profile (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      created_at INTEGER NOT NULL,
      UNIQUE(id, display_name)
    )
  `,
    connections: `
    CREATE TABLE IF NOT EXISTS connections (
      id INTEGER PRIMARY KEY,
      connected_at INTEGER NOT NULL,
      issuer TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      avatar_uri TEXT,
      raw_payload TEXT NOT NULL
    )
  `,
    //     Semantic Triples
    node_types: `
        CREATE TABLE IF NOT EXISTS object_types (
            id INTEGER PRIMARY KEY,
            label TEXT NOT NULL UNIQUE, -- "Person", "Organization", "Event", "Place", "URL", "Username"
            icon TEXT
        )
    `,
    predicates: `
        CREATE TABLE IF NOT EXISTS predicates (
            id INTEGER PRIMARY KEY,
            label TEXT NOT NULL UNIQUE, -- "works at", "knows", "attended", "linkedin"
            object_type_id INTEGER,
            FOREIGN KEY (object_type_id) REFERENCES object_types(id)
        )
    `,
    nodes: `
        CREATE TABLE IF NOT EXISTS nodes (
              id INTEGER PRIMARY KEY,
              label TEXT NOT NULL,       -- "Acme Corp", "ETH Denver", "john doe"
              value TEXT,                -- raw value if different from label
              UNIQUE(label, value)
        )
    `,
    triples: `
        CREATE TABLE IF NOT EXISTS triples (
             id INTEGER PRIMARY KEY,
             subject_id INTEGER NOT NULL,  -- references connections.id
             predicate_id INTEGER NOT NULL,
             object_id INTEGER NOT NULL,
             created_at INTEGER NOT NULL,
             FOREIGN KEY (subject_id) REFERENCES connections(id),
             FOREIGN KEY (predicate_id) REFERENCES predicates(id),
             FOREIGN KEY (object_id) REFERENCES nodes(id),
            UNIQUE(subject_id, predicate_id, object_id)
        );
    `,
    profileFields: `
    CREATE TABLE IF NOT EXISTS profile_fields (
      id INTEGER PRIMARY KEY,
      profile_id TEXT NOT NULL,
      predicate_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      share_by_default INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
      FOREIGN KEY (predicate_id) REFERENCES predicates(id),
      FOREIGN KEY (node_id) REFERENCES nodes(id),
      UNIQUE(profile_id, predicate_id, node_id)
    )
  `,

    masks: `
    CREATE TABLE IF NOT EXISTS masks (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE,
      UNIQUE(name, profile_id)
    )
  `,

    maskFields: `
    CREATE TABLE IF NOT EXISTS mask_fields (
      mask_id INTEGER NOT NULL,
      profile_field_id INTEGER NOT NULL,
      PRIMARY KEY (mask_id, profile_field_id),
      FOREIGN KEY (mask_id) REFERENCES masks(id),
      FOREIGN KEY (profile_field_id) REFERENCES profile_fields(id) ON DELETE CASCADE,
      UNIQUE(mask_id, profile_field_id)
    )
  `,

    connectionFields: `
    CREATE TABLE IF NOT EXISTS connection_fields (
      id INTEGER PRIMARY KEY,
      connection_id INTEGER NOT NULL,
      predicate_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
      FOREIGN KEY (predicate_id) REFERENCES predicates(id),
      FOREIGN KEY (node_id) REFERENCES nodes(id),
      UNIQUE(connection_id, predicate_id, node_id)
    )
  `,

    annotations: `
    CREATE TABLE IF NOT EXISTS annotations (
      id INTEGER PRIMARY KEY,
      connection_id INTEGER NOT NULL,
      predicate_id INTEGER NOT NULL,
      node_id INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (connection_id) REFERENCES connections(id) ON DELETE CASCADE,
      FOREIGN KEY (predicate_id) REFERENCES predicates(id),
      FOREIGN KEY (node_id) REFERENCES nodes(id),
      UNIQUE(connection_id, predicate_id, node_id)
    )
  `
};


export async function initDatabase() {
    if (dbInstance) return dbInstance;

    const db = await SQLite.openDatabaseAsync("rolodex.db");

    await db.execAsync('PRAGMA foreign_keys = ON');

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