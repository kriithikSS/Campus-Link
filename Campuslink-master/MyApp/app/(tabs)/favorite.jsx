
import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Shared from '../../Shared/Shared'
import { useUser } from '@clerk/clerk-expo'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../config/FirebaseConfig'
import SRMListItem from './../../components/Home/SRMListItem'

export default function Favorite() {

  const { user } = useUser();
  const [favIds, setFavIds] = useState([]);
  const [FavSRMList, setFavSRMList] = useState([]);
  const [loader, setLoader] = useState(false);

  // Fetch favorite IDs and SRM items
  const GetFavSRMList = async () => {
    setLoader(true);
    const result = await Shared.GetFavList(user);

    if (result?.favorites && result.favorites.length > 0) {
      setFavIds(result.favorites);
      GetFavSRMIds(result.favorites);
    } else {
      setFavSRMList([]);  // Clear the list if no favorites
      setLoader(false);    // Stop the loader
    }
  };

  // Fetch SRM items based on favorite IDs
  const GetFavSRMIds = async (favoriteIds) => {
    if (favoriteIds.length > 0) {
      const q = query(collection(db, 'Works'), where('id', 'in', favoriteIds));
      const querySnapshot = await getDocs(q);

      const fetchedSRMList = querySnapshot.docs.map(doc => doc.data());  // Map to extract data
      setFavSRMList(fetchedSRMList);  // Replace list with fetched data
    }
    setLoader(false);  // Stop the loader
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    GetFavSRMList();  // Re-fetch favorites when user pulls the list
  };

  // This will trigger the refresh whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      if (user) {
        GetFavSRMList();
      }
    }, [user])
  );

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfit-med', fontSize: 30 }}>Favourites</Text>

      {FavSRMList.length === 0 && !loader ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No favourites to display.
        </Text>
      ) : (
        <FlatList
          data={FavSRMList}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={{
              flex:1,
              margin:10
            }}>
              <SRMListItem SRM={item} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}  // Ensure unique keys for FlatList
          

          // Refresh control for pull-to-refresh functionality
          refreshControl={
            <RefreshControl
              refreshing={loader}  // Controlled by the loader state
              onRefresh={handleRefresh}  // Re-fetch data when pulled
            />
          }
        />
      )}
    </View>
  );
}
