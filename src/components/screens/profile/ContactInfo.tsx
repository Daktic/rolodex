import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KVBContainer, { KeyValuePair } from '../../common/KVBContainer';

export default function ContactInfo() {
  const [fields, setFields] = useState<KeyValuePair[]>([
    { id: '1', key: 'Name', value: '' },
    { id: '2', key: 'Phone', value: '' },
    { id: '3', key: 'Email', value: '' },
  ]);

  const handleUpdate = (id: string, key: string, value: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, key, value } : field
      )
    );
  };

  const handleDelete = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  const handleAdd = () => {
    const newId = String(Date.now());
    setFields((prev) => [
      ...prev,
      { id: newId, key: '', value: '' },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Contact Fields</Text>
      <KVBContainer
        items={fields}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAdd={handleAdd}
        showAddButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
