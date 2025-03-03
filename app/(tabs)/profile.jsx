import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import React from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext"; // Fixed import path

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useClerkAuth();
  const { isAdmin } = useAuth(); // Get admin status from our context
  const router = useRouter();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        onPress: () => {
          signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleReturnToAdmin = () => {
    router.replace("/admin");
  };

  return (
    <View style={styles.container}>
      {/* User Profile Section */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: user?.imageUrl }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>

      {/* Options Section */}
      <View style={styles.optionsContainer}>
        <Link href="/profile/edit-profile" asChild>
          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Edit Profile</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile/my-events" asChild>
          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>My Registered Events</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/profile/help-support" asChild>
          <TouchableOpacity style={styles.option}>
            <Text style={styles.optionText}>Help & Support</Text>
          </TouchableOpacity>
        </Link>

        {/* Admin Return Option - Only show if user is admin */}
        {isAdmin && (
          <TouchableOpacity style={styles.adminOption} onPress={handleReturnToAdmin}>
            <Text style={styles.adminOptionText}>Return to Admin Dashboard</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: "Roboto-bold",
    fontSize: 22,
    marginBottom: 5,
  },
  userEmail: {
    fontFamily: "Roboto-reg",
    fontSize: 16,
    color: Colors.GRAY,
  },
  optionsContainer: {
    marginTop: 10,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  optionText: {
    fontFamily: "Roboto-med",
    fontSize: 16,
  },
  adminOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
    backgroundColor: Colors.LIGHT_PRIMARY,
  },
  adminOptionText: {
    fontFamily: "Roboto-bold",
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  signOutButton: {
    marginTop: 30,
    backgroundColor: Colors.DANGER,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: "Roboto-bold",
    fontSize: 16,
    color: Colors.WHITE,
  },
});