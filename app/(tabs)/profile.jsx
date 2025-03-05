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
        <View>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      {/* Admin Dashboard */}
      {isAdmin && (
        <TouchableOpacity style={styles.adminOption} onPress={() => router.replace('/admin')}>
          <Text style={styles.adminOptionText}>Return to Admin Dashboard</Text>
        </TouchableOpacity>
      )}

      {/* Menu Options */}
      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress(item)}>
            <Ionicons name={item.icon} size={28} color={Colors.PRIMARY} style={styles.icon} />
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
  userName: { fontFamily: 'Roboto-bold', fontSize: 22, marginBottom: 5 },
  userEmail: { fontFamily: 'Roboto-reg', fontSize: 16, color: Colors.GRAY },
  adminOption: { paddingVertical: 15, backgroundColor: Colors.LIGHT_PRIMARY, marginBottom: 10, alignItems: 'center', borderRadius: 8 },
  adminOptionText: { fontFamily: 'Roboto-bold', fontSize: 16, color: Colors.PRIMARY },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, backgroundColor: '#f5f5f5', marginVertical: 5 },
  icon: { padding: 10, backgroundColor: Colors.LIGHT_PRIMARY, borderRadius: 8 },
  menuText: { fontFamily: 'Roboto-med', fontSize: 18, marginLeft: 10 }
});
