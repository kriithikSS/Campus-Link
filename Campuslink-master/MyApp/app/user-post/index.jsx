import { View, Text, FlatList } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import SRMListItem from "../../components/Home/SRMListItem";

export default function UserPost() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [userPostList, setUserPostList] = useState([]);

  useEffect(() => {
    navigation.setOptions({ headerTitle: "User Post" });

    if (user) {
      console.log("📩 Clerk User Email:", user.primaryEmailAddress?.email);
      GetUserPost();
    }
  }, [user]);

  const GetUserPost = async () => {
    if (!user) return;

    const userEmail = user.primaryEmailAddress?.email?.trim().toLowerCase(); // 🔥 Normalize Email
    console.log("🔍 Fetching posts for:", userEmail);

    try {
      const q = query(
        collection(db, "Works"), // ✅ Ensure the correct collection
        where("Mail", "==", userEmail) // ✅ Make sure "Mail" is exactly matching
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("⚠️ No posts found for:", userEmail);
        console.log("📜 Firestore Expected Email: '3dmodelling@gmail.com' (Check Spacing & Casing)");
        setUserPostList([]);
      } else {
        const posts = querySnapshot.docs.map((doc) => doc.data());
        console.log("✅ Posts found:", posts);
        setUserPostList(posts);
      }
    } catch (error) {
      console.error("❌ Error fetching user posts:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontFamily: "outfit", fontSize: 18, color: "black" }}>UserPost</Text>

      {userPostList.length === 0 && <Text style={{ color: "red" }}>No posts available</Text>}

      <FlatList
        data={userPostList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <SRMListItem SRM={item} />}
      />
    </View>
  );
}
