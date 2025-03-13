import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerkAuth();
  const { isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  // Get colors based on current theme
  const themeColors = Colors.getTheme(isDarkMode);

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
    <View style={[styles.container, { backgroundColor: themeColors.BACKGROUND }]}>
      {/* User Info */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user?.imageUrl }} style={styles.profileImage} />
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={() => Alert.alert("Full Name", userName)}>
            <Text 
              numberOfLines={isLongName ? 2 : 1} 
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              style={[
                styles.userName, 
                isLongName && styles.longUserName,
                { color: themeColors.TEXT }
              ]}>
              {userName}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.userEmail, { color: themeColors.GRAY }]}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>
      </View>

      {/* Dark Mode Toggle */}
      <TouchableOpacity 
        style={[
          styles.themeToggleContainer, 
          { backgroundColor: themeColors.MENU_BACKGROUND }
        ]} 
        onPress={toggleTheme}
      >
        <View style={styles.themeTextContainer}>
          <Ionicons 
            name={isDarkMode ? "moon" : "sunny"} 
            size={24} 
            color={themeColors.PRIMARY} 
            style={[
              styles.icon, 
              { backgroundColor: isDarkMode ? '#333' : themeColors.LIGHTGREY }
            ]} 
          />
          <Text style={[styles.menuText, { color: themeColors.TEXT }]}>
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </Text>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: "#767577", true: Colors.PRIMARY }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </TouchableOpacity>

      {/* Admin Dashboard - Improved UI */}
      {isAdmin && (
        <TouchableOpacity 
          style={[
            styles.adminOption, 
            { 
              backgroundColor: themeColors.ADMIN_BACKGROUND,
              borderLeftColor: themeColors.PRIMARY
            }
          ]} 
          onPress={() => router.replace('/admin')}
          activeOpacity={0.8}
        >
          <View style={[styles.adminIconContainer, { backgroundColor: themeColors.PRIMARY }]}>
            <Ionicons name="shield-checkmark" size={24} color={isDarkMode ? '#121212' : themeColors.WHITE} />
          </View>
          <View style={styles.adminTextContainer}>
            <Text style={[styles.adminOptionText, { color: themeColors.PRIMARY }]}>Admin Dashboard</Text>
            <Text style={[styles.adminSubtitle, { color: themeColors.GRAY }]}>Manage events, users and more</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={themeColors.PRIMARY} />
        </TouchableOpacity>
      )}

      {/* Menu Options */}
      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.menuItem, 
              { backgroundColor: themeColors.MENU_BACKGROUND }
            ]} 
            onPress={() => handleMenuPress(item)}
          >
            <Ionicons 
              name={item.icon} 
              size={30} 
              color={themeColors.PRIMARY} 
              style={[
                styles.icon, 
                { backgroundColor: isDarkMode ? '#333' : themeColors.LIGHTGREY }
              ]} 
            />
            <Text style={[styles.menuText, { color: themeColors.TEXT }]}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20
  },
  profileContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30, 
    marginTop: 20 
  },
  profileImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    marginRight: 15 
  },
  textContainer: { 
    flex: 1 
  },
  userName: { 
    fontFamily: 'Roboto-bold', 
    fontSize: 22, 
    marginBottom: 5, 
    flexShrink: 1, 
    maxWidth: '80%', 
    textAlign: 'left'
  },
  longUserName: { 
    fontSize: 18,
    maxWidth: '100%', 
    flexWrap: 'wrap', 
    lineHeight: 22
  },
  userEmail: { 
    fontFamily: 'Roboto-reg', 
    fontSize: 16
  },
  
  // Theme Toggle Container
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },
  themeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Admin Dashboard Button
  adminOption: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adminIconContainer: {
    padding: 10,
    borderRadius: 10,
    marginRight: 15,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminOptionText: { 
    fontFamily: 'Roboto-bold', 
    fontSize: 18
  },
  adminSubtitle: {
    fontFamily: 'Roboto-reg',
    fontSize: 14,
    marginTop: 2,
  },
  
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 5 
  },
  icon: { 
    padding: 10, 
    borderRadius: 8 
  },
  menuText: { 
    fontFamily: 'Roboto-med', 
    fontSize: 18, 
    marginLeft: 10 
  }
});