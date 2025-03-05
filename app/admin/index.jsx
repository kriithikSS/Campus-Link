import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

const AdminDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>
        Welcome, {user?.firstName || 'Admin'}
      </Text>
      
      <ScrollView style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/admin/manage-events')}
        >
          <Text style={styles.menuItemText}>Add Post</Text>
          <Text style={styles.menuItemDescription}>
            Add Post
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/admin/user-management')}
        >
          <Text style={styles.menuItemText}>Manage post</Text>
          <Text style={styles.menuItemDescription}>
          Edit, or remove campus Posts created
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/admin/analytics')}
        >
          <Text style={styles.menuItemText}>Analytics</Text>
          <Text style={styles.menuItemDescription}>
            View event participation and app usage
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(tabs)/home')}
        >
          <Text style={styles.menuItemText}>Return to Main App</Text>
          <Text style={styles.menuItemDescription}>
            Switch to regular user view
          </Text>
        </TouchableOpacity>
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
    textAlign: 'center',
    color: Colors.PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-med',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.GRAY,
  },
  menuContainer: {
    flex: 1,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    boxShadow: '0px 1px 1.41px rgba(0, 0, 0, 0.2)', // New boxShadow format
    elevation: 2, // Still needed for Android
  },
  
  menuItemText: {
    fontSize: 18,
    fontFamily: 'Roboto-bold',
    marginBottom: 5,
    color: Colors.PRIMARY,
  },
  menuItemDescription: {
    fontSize: 14,
    fontFamily: 'Roboto-reg',
    color: Colors.GRAY,
  },
});

export default AdminDashboard;