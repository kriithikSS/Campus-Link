import { 
  View, Text, Image, FlatList, TouchableOpacity, StyleSheet, 
  Alert, Animated, StatusBar, Platform, Dimensions
} from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function Profile() {
  // Define Menu first to fix the "undefined" error
  const Menu = [
    { id: 1, name: 'Favorites', icon: 'heart', path: '/(tabs)/favorite' },
    { id: 2, name: 'My Registered Events', icon: 'calendar', path: '/profile/my-events' },
    { id: 3, name: 'Search', icon: 'search', path: '/(tabs)/search' },
    { id: 4, name: 'Help & Support', icon: 'help-circle', path: '/profile/help-support' },
    { id: 5, name: 'Logout', icon: 'exit', path: 'logout' }
  ];

  // State and hooks
  const { user } = useUser();
  const { signOut } = useClerkAuth();
  const { isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  
  // Animation values - now referencing Menu after it's defined
  const scrollY = useRef(new Animated.Value(0)).current;
  const profileScaleAnim = useRef(new Animated.Value(1)).current;
  const menuItemAnimations = useRef(Menu.map(() => new Animated.Value(0))).current;
  const adminAnim = useRef(new Animated.Value(0)).current;
  const themeToggleAnim = useRef(new Animated.Value(0)).current;
  
  // Get colors based on current theme
  const themeColors = Colors.getTheme(isDarkMode);

  // User data
  const userName = user?.fullName || "User";
  const isLongName = userName.length > 20;
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase();
  
  // Run entrance animations
  useEffect(() => {
    // Profile animation
    Animated.spring(profileScaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
    
    // Theme toggle animation
    Animated.timing(themeToggleAnim, {
      toValue: 1,
      duration: 400,
      delay: 100,
      useNativeDriver: true,
    }).start();
    
    // Admin panel animation
    if (isAdmin) {
      Animated.spring(adminAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
    
    // Staggered menu item animations
    Animated.stagger(
      50,
      menuItemAnimations.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  // Handle menu option press
  const handleMenuPress = (menu) => {
    // Apply press animation
    Animated.sequence([
      Animated.timing(menuItemAnimations[Menu.indexOf(menu)], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(menuItemAnimations[Menu.indexOf(menu)], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    // Handle logout differently
    if (menu.path === 'logout') {
      Alert.alert(
        "Sign Out", 
        "Are you sure you want to sign out?", 
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Sign Out", 
            onPress: () => { 
              signOut(); 
              router.replace("/login"); 
            },
            style: "destructive"
          }
        ],
        { cancelable: true }
      );
      return;
    }
    
    // Navigate to selected screen
    router.push(menu.path);
  };

  // Animation for profile header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [150, 100],
    extrapolate: 'clamp',
  });
  
  const imageSize = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [80, 60],
    extrapolate: 'clamp',
  });

  // Render Menu Item
  const renderMenuItem = ({ item, index }) => {
    // Special styling for logout
    const isLogout = item.name === 'Logout';
    
    return (
      <Animated.View style={{
        transform: [{ 
          scale: menuItemAnimations[index],
        }],
        opacity: menuItemAnimations[index],
        transform: [{ 
          translateY: menuItemAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }) 
        }],
      }}>
        <TouchableOpacity 
          style={[
            styles.menuItem, 
            { 
              backgroundColor: isLogout 
                ? (isDarkMode ? '#4a0000' : '#fff5f5')
                : themeColors.MENU_BACKGROUND,
              borderColor: themeColors.BORDER,
            },
          ]} 
          onPress={() => handleMenuPress(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: isLogout 
                ? (isDarkMode ? '#600' : '#ffecec')
                : (isDarkMode ? '#333' : themeColors.LIGHTGREY)
            }
          ]}>
            <Ionicons 
              name={item.icon} 
              size={22} 
              color={isLogout ? '#ff3b30' : themeColors.PRIMARY} 
            />
          </View>
          <Text style={[
            styles.menuText, 
            { 
              color: isLogout ? '#ff3b30' : themeColors.TEXT,
              fontFamily: isLogout ? 'Roboto-med' : 'Roboto-med',
            }
          ]}>
            {item.name}
          </Text>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={isLogout ? '#ff3b30' : themeColors.GRAY} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.BACKGROUND }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={themeColors.BACKGROUND}
      />
      
      {/* Animated Profile Header */}
      <Animated.View style={[
        styles.profileHeaderContainer,
        { 
          height: headerHeight,
          backgroundColor: themeColors.CARD_BACKGROUND,
        }
      ]}>
        <Animated.View style={[
          styles.profileContainer,
          {
            transform: [{ scale: profileScaleAnim }],
            opacity: profileScaleAnim,
          }
        ]}>
          {user?.imageUrl ? (
            <Animated.Image 
              source={{ uri: user.imageUrl }} 
              style={[
                styles.profileImage,
                { width: imageSize, height: imageSize, borderRadius: 40 }
              ]} 
            />
          ) : (
            <Animated.View style={[
              styles.initialsContainer,
              { 
                width: imageSize, 
                height: imageSize, 
                backgroundColor: themeColors.PRIMARY 
              }
            ]}>
              <Text style={styles.initialsText}>{userInitials}</Text>
            </Animated.View>
          )}
          
          <View style={styles.textContainer}>
            <TouchableOpacity 
              onPress={() => Alert.alert("Full Name", userName)}
              activeOpacity={0.7}
            >
              <Text 
                numberOfLines={isLongName ? 2 : 1} 
                ellipsizeMode="tail"
                style={[
                  styles.userName, 
                  isLongName && styles.longUserName,
                  { color: themeColors.TEXT }
                ]}
              >
                {userName}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.userEmail, { color: themeColors.GRAY }]}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Main Content */}
      <Animated.FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            {/* Dark Mode Toggle - Completely removed the Switch component */}
            <Animated.View style={{
              opacity: themeToggleAnim,
              transform: [{ 
                translateY: themeToggleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0], 
                })
              }],
            }}>
              <TouchableOpacity 
                style={[
                  styles.themeToggleContainer, 
                  { 
                    backgroundColor: themeColors.MENU_BACKGROUND,
                    borderColor: themeColors.BORDER,
                  }
                ]} 
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <View style={styles.themeTextContainer}>
                  <View style={[
                    styles.iconContainer,
                    { backgroundColor: isDarkMode ? '#333' : themeColors.LIGHTGREY }
                  ]}>
                    <Ionicons 
                      name={isDarkMode ? "moon" : "sunny"} 
                      size={22} 
                      color={themeColors.PRIMARY} 
                    />
                  </View>
                  <Text style={[styles.menuText, { color: themeColors.TEXT }]}>
                    {isDarkMode ? "Dark Mode" : "Light Mode"}
                  </Text>
                </View>
                {/* Status indicator circle instead of switch */}
                <View style={[
                  styles.themeIndicator, 
                  { backgroundColor: isDarkMode ? Colors.PRIMARY : themeColors.GRAY }
                ]} />
              </TouchableOpacity>
            </Animated.View>

            {/* Admin Dashboard - Improved UI */}
            {isAdmin && (
              <Animated.View style={{
                opacity: adminAnim,
                transform: [{ 
                  translateY: adminAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }) 
                }],
              }}>
                <TouchableOpacity 
                  style={[
                    styles.adminOption, 
                    { 
                      backgroundColor: isDarkMode ? '#2c2542' : '#f5f0ff',
                      borderLeftColor: themeColors.PRIMARY,
                      borderColor: themeColors.BORDER,
                    }
                  ]} 
                  onPress={() => router.replace('/admin')}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.adminIconContainer, 
                    { backgroundColor: themeColors.PRIMARY }
                  ]}>
                    <Ionicons 
                      name="shield-checkmark" 
                      size={22} 
                      color={isDarkMode ? '#121212' : themeColors.WHITE} 
                    />
                  </View>
                  <View style={styles.adminTextContainer}>
                    <Text style={[
                      styles.adminOptionText, 
                      { color: isDarkMode ? '#e0b5ff' : themeColors.PRIMARY }
                    ]}>
                      Admin Dashboard
                    </Text>
                    <Text style={[styles.adminSubtitle, { color: themeColors.GRAY }]}>
                      Manage events, users and more
                    </Text>
                  </View>
                  <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.PRIMARY} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}

            <Text style={[
              styles.sectionTitle, 
              { color: themeColors.GRAY }
            ]}>
              MENU OPTIONS
            </Text>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  profileHeaderContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  profileContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  },
  profileImage: { 
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  initialsText: {
    fontFamily: 'Roboto-bold',
    fontSize: 28,
    color: '#fff',
  },
  textContainer: { 
    marginLeft: 15,
    flex: 1, 
  },
  userName: { 
    fontFamily: 'Roboto-bold', 
    fontSize: 24, 
    marginBottom: 5, 
    flexShrink: 1, 
    maxWidth: '90%', 
    textAlign: 'left'
  },
  longUserName: { 
    fontSize: 20,
    maxWidth: '100%', 
    flexWrap: 'wrap', 
    lineHeight: 22
  },
  userEmail: { 
    fontFamily: 'Roboto-reg', 
    fontSize: 16
  },
  
  // Content container
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120,
  },
  
  // Section title
  sectionTitle: {
    fontFamily: 'Roboto-med',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1.2,
  },
  
  // Theme Toggle Container
  themeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
  },
  themeTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Theme indicator (small circle instead of switch)
  themeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  
  // Admin Dashboard Button
  adminOption: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  adminIconContainer: {
    padding: 10,
    borderRadius: 12,
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
  chevronContainer: {
    padding: 6,
  },
  
  // Menu Items
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 12,
    marginRight: 15,
  },
  menuText: { 
    fontFamily: 'Roboto-med', 
    fontSize: 16, 
    flex: 1,
  }
});