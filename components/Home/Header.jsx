import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { user } = useUser();
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View>
        <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome</Text>

          <Text 
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[styles.nameText, { color: colors.text }]}
          >
            {user?.fullName}
          </Text>
        </View>
        
        <View style={styles.imageWrapper}>
          <LinearGradient
            colors={isDarkMode ? ['#222', '#444'] : ['#4776E6', '#8E54E9']} // Change gradient in dark mode
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Image 
              source={{ uri: user?.imageUrl }} 
              style={styles.profileImage}
            />
          </LinearGradient>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    marginTop: 10,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: 'outfit-reg',
    fontSize: 16,
    marginBottom: 4,
  },
  nameText: {
    fontFamily: 'outfit-med',
    fontSize: 24,
    maxWidth: '90%',
  },
  imageWrapper: {
    padding: 2,
    borderRadius: 999,
  },
  gradient: {
    width: 58,
    height: 58,
    borderRadius: 999,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 52,
    height: 52,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#ffffff',
  }
});
