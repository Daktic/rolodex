import {
    Profile,
    ProfileField,
    Mask,
    Connection,
    ConnectionField,
    ProfileFields,
    AnnotationField, Predicate, ObjectType, SemanticNode, Predicates, Icon
} from "@/types/db";
import {getDatabase} from "@/services/db";


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
     ON CONFLICT(id) DO NOTHING`,
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
// Semantic Operations
// ============================================================================
async function upsertPredicate(label: string, icon?: string) {
    const db = getDatabase();
    let iconId = null;
    if (icon) {iconId = await getIconId(icon);}

  const row = await db.getFirstAsync<{ id: number }>(
    `INSERT INTO predicates (label, icon_id)
     VALUES (?, ?)
     ON CONFLICT(label) DO UPDATE SET label = excluded.label
     returning id`,
    [label, iconId]
  );

  return row!.id;
}

async function getAllPredicates(): Promise<Predicate[]> {
    const db = getDatabase();
    return await db.getAllAsync<Predicate>(`
        SELECT * FROM predicates LEFT JOIN icons ON predicates.icon_id = icons.id`);
}

async function upsertObjectType(label: string) {
  const db = getDatabase();
  const row = await db.getFirstAsync<{ id: number }>(
    `INSERT INTO object_types (label)
     VALUES (?)
     ON CONFLICT(label) DO UPDATE SET label = excluded.label
     returning id`,
    [label]
  );

  return row!.id;
}

async function upsertIcon(label: string): Promise<number> {
    const db = getDatabase();
    const row = await db.getFirstAsync<{ id: number }>(
        `INSERT INTO icons (label) VALUES (?)
         ON CONFLICT(label) DO UPDATE SET label = excluded.label
         returning id`,
        [label]
    );
    return row!.id;
}

async function getAllIcons(): Promise<Icon[]> {
    const db = getDatabase();
    return await db.getAllAsync<Icon>('SELECT * FROM icons');
}

async function getIconId(label: string): Promise<number | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM icons WHERE label = ?`,
        [label]
    );
    return row?.id ?? null;
}

async function getAllObjectTypes(): Promise<ObjectType[]> {
    const db = getDatabase();
    return await db.getAllAsync<ObjectType>("SELECT * FROM object_types");
}

async function upsertPredicateObjectType(predicateId: number, objectTypeId: number): Promise<void> {
    const db = getDatabase();
    await db.runAsync(
        `INSERT INTO predicate_object_types (predicate_id, object_type_id)
         VALUES (?, ?)
         ON CONFLICT(predicate_id, object_type_id) DO NOTHING`,
        [predicateId, objectTypeId]
    );
}

async function getAllPredicateObjects(): Promise<Predicates[]> {
    const db = getDatabase();
    return await db.getAllAsync<Predicates>(
        `SELECT
            predicates.id,
            predicates.label,
            GROUP_CONCAT(object_types.label) as objectLabel,
            icons.label as iconName
        FROM predicates
        LEFT JOIN predicate_object_types pot ON predicates.id = pot.predicate_id
        LEFT JOIN object_types ON pot.object_type_id = object_types.id
        LEFT JOIN icons ON predicates.icon_id = icons.id
        GROUP BY predicates.id`
    );
}

async function upsertObject(label: string, value?: string) {
  const db = getDatabase();
  const rawValue = value ?? label;

  const row = await db.getFirstAsync<{ id: number }>(
    `INSERT INTO nodes (label, value)
     VALUES (?, ?)
     ON CONFLICT(label, value) DO UPDATE 
         SET label = excluded.label, value = excluded.value
     returning id`,
    [label, rawValue]
  );

  return row!.id;
}

const getAllNodes = async (): Promise<SemanticNode[]> => {
  const db = getDatabase();
  return await db.getAllAsync<SemanticNode>("SELECT * FROM nodes");
};

async function upsertTriple(subjectID: number, predicateID: number, objectID: number, createdAt?: number) {
  const db = getDatabase();
  const timestamp = createdAt || Date.now();
  const row = await db.getFirstAsync<{ id: number }>(
    `INSERT INTO tipples (subject_id, predicate_id, object_id, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(subject_id, predicate_id, object_id) DO NOTHING
     returning id`,
    [subjectID, predicateID, objectID, timestamp]
  );

  return row!.id;
}

// ============================================================================
// Profile Fields Operations
// ============================================================================

async function upsertProfileField(
  profileId: string,
  label: string,
  value: string,
  shareByDefault: boolean
): Promise<void> {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    const predicateID = await upsertPredicate(label);
    const nodeID = await upsertObject(value);
    console.log("upsertProfileField ids:", { profileId, predicateID, nodeID });

    await db.runAsync(
      `INSERT INTO profile_fields (profile_id, predicate_id, node_id, share_by_default)
       VALUES (?, ?, ?, ?)
         ON CONFLICT(profile_id, predicate_id, node_id) DO UPDATE SET
         predicate_id = excluded.predicate_id,
         node_id = excluded.node_id,
         share_by_default = excluded.share_by_default`,
      [profileId, predicateID, nodeID, shareByDefault ? 1 : 0]
    );
  })
}

async function getProfileFields(profileId: string): Promise<ProfileFields[]> {
  const db = getDatabase();
  return await db.getAllAsync<ProfileFields>(
    `SELECT 
                profile_fields.id,
                profile_fields.profile_id,
                predicates.label AS label,
                nodes.label AS value,
                icons.label AS icon
            FROM profile_fields
            JOIN predicates ON profile_fields.predicate_id = predicates.id
            JOIN nodes ON profile_fields.node_id = nodes.id
            LEFT JOIN icons on predicates.icon_id = icons.id
            WHERE profile_id = ?
            `,
    [profileId]
  );
}

async function deleteProfileField(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM profile_fields WHERE id = ?", [id]);
}

async function updateProfileField(
  id: number,
  label: string,
  value: string,
  shareByDefault: boolean
): Promise<void> {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    const predicateID = await upsertPredicate(label);
    const nodeID = await upsertObject(value);
    await db.runAsync(
      `UPDATE profile_fields SET predicate_id = ?, node_id = ?, share_by_default = ? WHERE id = ?`,
      [predicateID, nodeID, shareByDefault ? 1 : 0, id]
    );
  });
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
  console.log("upsertMask: Inserting mask with:", {name, profileId, timestamp });
  await db.runAsync(
    `INSERT INTO masks (name, profile_id, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(name, profile_id) DO UPDATE SET name = excluded.name`,
    [name, profileId, timestamp]
  );
  console.log("upsertMask: Insert completed");

  // Verify the mask was inserted
  const verifyMask = await db.getFirstAsync<Mask>(
    "SELECT * FROM masks WHERE name = ?",
    [name]
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

  // If no masks exist, create a default "Default" mask
  if (masks.length === 0) {
    console.log("getMasks: No masks found, creating default 'Default' mask for profile:", profileId);
    try {
      await upsertMask("Default", profileId);
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

async function getMask(id: number): Promise<Mask | null> {
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
  maskId: number,
  profileFieldIds: number[]
): Promise<void> {
  const db = getDatabase();
  // Delete existing associations
  await db.runAsync("DELETE FROM mask_fields WHERE mask_id = ?", [maskId]);

  console.log("setting mask fields", {maskId, profileFieldIds});

  // Insert new associations
  for (const fieldId of profileFieldIds) {
    await db.runAsync(
      `
          INSERT INTO mask_fields (mask_id, profile_field_id)
          VALUES (?, ?)
              ON CONFLICT(mask_id, profile_field_id) DO NOTHING
      `,
      [maskId, fieldId]
    );
  }
}

async function getMaskFields(maskId: number): Promise<ProfileField[]> {
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
  issuer: string,
  displayName: string,
  rawPayload: string,
  avatarUri?: string | null,
  connectedAt?: number
): Promise<number> {
  const db = getDatabase();
  const timestamp = connectedAt || Date.now();
  const row = await db.getFirstAsync<{ id: number }>(
    `INSERT INTO connections (connected_at, issuer, display_name, avatar_uri, raw_payload)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(issuer) DO UPDATE SET
       display_name = excluded.display_name,
       avatar_uri = excluded.avatar_uri,
       raw_payload = excluded.raw_payload
       returning id`,
    [timestamp, issuer, displayName, avatarUri?? null, rawPayload]
  );
  return row!.id
}

async function getConnection(id: number): Promise<Connection | null> {
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

async function deleteConnection(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM connections WHERE id = ?", [id]);
}

// ============================================================================
// Connection Fields Operations
// ============================================================================

async function upsertConnectionField(
  connectionId: number,
  label: string,
  value: string
): Promise<void> {
  const db = getDatabase();
  await db.withTransactionAsync(async () => {
    const predicateID = await upsertPredicate(label);
    const nodeID = await upsertObject(value);

    await db.runAsync(
        `INSERT INTO connection_fields (connection_id, predicate_id, node_id)
     VALUES (?, ?, ?)
     ON CONFLICT(connection_id, predicate_id, node_id) DO UPDATE SET
       predicate_id = excluded.predicate_id,
       node_id = excluded.node_id`,
        [connectionId, predicateID, nodeID]
    );
  })
}

async function getConnectionFields(connectionId: number): Promise<ConnectionField[]> {
  const db = getDatabase();
  return await db.getAllAsync<ConnectionField>(
    `SELECT 
                connection_fields.id,
                predicates.label AS label,
                nodes.label AS value
            FROM connection_fields
            JOIN predicates ON connection_fields.predicate_id = predicates.id
            JOIN nodes ON connection_fields.node_id = nodes.id
            WHERE connection_id = ?
            `,
    [connectionId]
  );
}

// I don't think we should allow this, but unsure
async function deleteConnectionField(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM connection_fields WHERE id = ?", [id]);
}

// ============================================================================
// Annotation Operations
// ============================================================================

async function upsertAnnotation(
  connectionId: number,
  label: string,
  value: string,
  createdAt?: number
): Promise<void> {
  const db = getDatabase();
  const timestamp = createdAt || Date.now();
  await db.withTransactionAsync(async () => {
    const predicateID = await upsertPredicate(label);
    const nodeID = await upsertObject(value);

    await db.runAsync(
        `INSERT INTO annotations (connection_id, predicate_id, node_id, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(connection_id, predicate_id, node_id) DO UPDATE SET
       predicate_id = excluded.predicate_id,
       node_id = excluded.node_id`,
        [connectionId, predicateID, nodeID, timestamp]
    );
  })

}

async function getAnnotations(connectionId: number): Promise<AnnotationField[]> {
  const db = getDatabase();
  return await db.getAllAsync<AnnotationField>(
    `SELECT
                annotations.id,
                GROUP_CONCAT(object_types.label) AS type,
                predicates.label AS label,
                nodes.label AS value,
                annotations.created_at
            FROM annotations
            JOIN predicates ON annotations.predicate_id = predicates.id
            JOIN nodes ON annotations.node_id = nodes.id
            LEFT JOIN predicate_object_types pot ON predicates.id = pot.predicate_id
            LEFT JOIN object_types ON pot.object_type_id = object_types.id
            WHERE connection_id = ?
            GROUP BY annotations.id
            ORDER BY annotations.created_at DESC`,
    [connectionId]
  );
}

async function deleteAnnotation(id: number): Promise<void> {
  const db = getDatabase();
  await db.runAsync("DELETE FROM annotations WHERE id = ?", [id]);
}

export {
  getDatabase,
  // Profile
  upsertProfile,
  updateProfileAvatar,
  updateProfileDisplayName,
  getProfile,
  deleteProfile,
  // Profile Fields
  upsertProfileField,
  updateProfileField,
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
  // Semantic
    getAllPredicates,
    getAllObjectTypes,
    getAllNodes,
    getAllPredicateObjects,
    upsertPredicate,
    upsertObjectType,
    upsertPredicateObjectType,
    upsertIcon,
    getAllIcons,
};