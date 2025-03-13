import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Shared from '../../Shared/Shared'
import { useUser } from '@clerk/clerk-expo'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import SRMListItem from './../../components/Home/SRMListItem'
import { useTheme } from '../../context/ThemeContext';

export default function Favorite() {

  const { colors, isDarkMode } = useTheme();
  const { user } = useUser();
  const [FavSRMList, setFavSRMList] = useState([]);
  const [loader, setLoader] = useState(false);

  // Fetch favorite post names from Firestore
  const GetFavSRMList = async () => {
    setLoader(true);
    const result = await Shared.GetFavList(user);

    if (result?.favorites && result.favorites.length > 0) {
      console.log("🟢 Favorite post names:", result.favorites);
      GetFavSRMByNames(result.favorites);
    } else {
      console.log("⚠️ No favorites found.");
      setFavSRMList([]);
      setLoader(false);
    }
  };

  // Fetch SRM items based on favorite names
  const GetFavSRMByNames = async (favoriteNames) => {
    if (favoriteNames.length > 0) {
      try {
        const q = query(collection(db, 'Works'), where('name', 'in', favoriteNames)); // 🔥 Search by post name
        const querySnapshot = await getDocs(q);

        const fetchedSRMList = querySnapshot.docs.map(doc => doc.data());  
        console.log("🟢 Fetched favorite SRM list:", fetchedSRMList);
        setFavSRMList(fetchedSRMList);
      } catch (error) {
        console.error("❌ Error fetching SRM list:", error);
      }
    }
    setLoader(false);
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    GetFavSRMList();
  };

  // Refresh when the tab is focused
  useFocusEffect(
    useCallback(() => {
      if (user) {
        GetFavSRMList();
      }
    }, [user])
  );

  return (
    <View style={{ padding: 20, marginTop: 20, backgroundColor: colors.background, flex: 1 }}>

      <Text style={{ fontFamily: 'outfit-med', fontSize: 30, color: colors.text }}>
  Favourites
      </Text>


      {FavSRMList.length === 0 && !loader ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
        No favourites to display.
      </Text>
      
      ) : (
        <FlatList
          data={FavSRMList}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal:0, backgroundColor: colors.background }}
          renderItem={({ item }) => (
            <View style={{ flex:1, margin:10 }}>
              <SRMListItem SRM={item} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl
              refreshing={loader}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
}
