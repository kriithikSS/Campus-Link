import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../../constants/Colors';

const ManageEvents = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Events</Text>
      <Text style={styles.subtitle}>
        Add, edit, or remove campus events
      </Text>
      
      <ScrollView>
        <Text style={styles.sectionTitle}>Events List</Text>
        {/* Your events management UI will go here */}
        <Text style={styles.emptyState}>
          Your events management UI will be implemented here.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Roboto-bold',
    marginBottom: 5,
    color: Colors.PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-reg',
    marginBottom: 20,
    color: Colors.GRAY,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-bold',
    marginTop: 15,
    marginBottom: 10,
  },
  emptyState: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    color: Colors.GRAY,
    fontFamily: 'Roboto-med',
  }
});

export default ManageEvents;