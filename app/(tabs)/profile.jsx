import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerkAuth();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const userName = user?.fullName || "User";
  const isLongName = userName.length > 20; // Adjust threshold if needed

  const Menu = [
    { id: 1, name: 'Favorites', icon: 'heart', path: '/(tabs)/favorite' },
    { id: 3, name: 'My Registered Events', icon: 'calendar', path: '/profile/my-events' },
    { id: 5, name: 'Search', icon: 'search', path: '/(tabs)/search' },
    { id: 4, name: 'Help & Support', icon: 'help-circle', path: '/profile/help-support' },
    { id: 6, name: 'Logout', icon: 'exit', path: 'logout' }
  ];

  const handleMenuPress = (menu) => {
    if (menu.path === 'logout') {
      Alert.alert("Sign Out", "Are you sure you want to sign out?", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", onPress: () => { signOut(); router.replace("/login"); } }
      ]);
      return;
    }
    router.push(menu.path);
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={() => Alert.alert("Full Name", userName)}>
            <Text 
              numberOfLines={isLongName ? 2 : 1} 
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              style={[styles.userName, isLongName && styles.longUserName]}>
              {userName}
            </Text>
          </TouchableOpacity>
          <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      {/* Admin Dashboard - Improved UI */}
      {isAdmin && (
        <TouchableOpacity 
          style={styles.adminOption} 
          onPress={() => router.replace('/admin')}
          activeOpacity={0.8}
        >
          <View style={styles.adminIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.WHITE} />
          </View>
          <View style={styles.adminTextContainer}>
            <Text style={styles.adminOptionText}>Admin Dashboard</Text>
            <Text style={styles.adminSubtitle}>Manage events, users and more</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Colors.PRIMARY} />
        </TouchableOpacity>
      )}

      {/* Menu Options */}
      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress(item)}>
            <Ionicons name={item.icon} size={30} color={Colors.PRIMARY} style={styles.icon} />
            <Text style={styles.menuText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: Colors.WHITE },
  profileContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 15 },
  textContainer: { flex: 1 }, // Allows text to take remaining space
  userName: { 
    fontFamily: 'Roboto-bold', 
    fontSize: 22, 
    marginBottom: 5, 
    flexShrink: 1, 
    maxWidth: '80%', 
    textAlign: 'left'
  },
  longUserName: { 
    fontSize: 18,  // Reduce size if name is long
    maxWidth: '100%', 
    flexWrap: 'wrap', 
    lineHeight: 22  // Improves readability
  },
  userEmail: { fontFamily: 'Roboto-reg', fontSize: 16, color: Colors.GRAY },
  
  // Improved Admin Dashboard Button
  adminOption: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#F0F5FF', // Light blue background
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.PRIMARY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adminIconContainer: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminOptionText: { 
    fontFamily: 'Roboto-bold', 
    fontSize: 18, 
    color: Colors.PRIMARY,
  },
  adminSubtitle: {
    fontFamily: 'Roboto-reg',
    fontSize: 14,
    color: Colors.GRAY,
    marginTop: 2,
  },
  
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#f5f5f5', marginVertical: 5 },
  icon: { padding: 10, backgroundColor: Colors.LIGHT_PRIMARY, borderRadius: 8 },
  menuText: { fontFamily: 'Roboto-med', fontSize: 18, marginLeft: 10 }
});