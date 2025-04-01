import { View, Text, FlatList, RefreshControl } from 'react-native';
import React, { useEffect, useState } from 'react';
import Shared from '../../Shared/Shared';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import SRMListItem from './../../components/Home/SRMListItem';
import { useTheme } from '../../context/ThemeContext';

export default function Favorite() {
  const { colors } = useTheme();
  const { user } = useUser();
  const [FavSRMList, setFavSRMList] = useState([]);
  const [loader, setLoader] = useState(false);

  // Fetch favorite post names from Firestore
  const GetFavSRMList = async () => {
    if (!user) return;
    
    setLoader(true);
    try {
      const result = await Shared.GetFavList(user);

      if (result?.favorites && result.favorites.length > 0) {
        console.log('🟢 Favorite post names:', result.favorites);
        await GetFavSRMByNames(result.favorites);
      } else {
        console.log('⚠️ No favorites found.');
        setFavSRMList([]);
      }
    } catch (error) {
      console.error('❌ Error fetching favorites:', error);
    } finally {
      setLoader(false);
    }
  };

  // Fetch SRM items based on favorite names (Handles Firestore 'in' query limitation)
  const GetFavSRMByNames = async (favoriteNames) => {
    try {
      let fetchedSRMList = [];

      // Firestore 'in' query only supports up to 10 items at a time
      const batchSize = 10;
      for (let i = 0; i < favoriteNames.length; i += batchSize) {
        const batch = favoriteNames.slice(i, i + batchSize);
        const q = query(collection(db, 'Works'), where('name', 'in', batch));
        const querySnapshot = await getDocs(q);
        fetchedSRMList = [...fetchedSRMList, ...querySnapshot.docs.map((doc) => doc.data())];
      }

      console.log('🟢 Fetched favorite SRM list:', fetchedSRMList);
      setFavSRMList(fetchedSRMList);
    } catch (error) {
      console.error('❌ Error fetching SRM list:', error);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = () => GetFavSRMList();

  // Fetch favorites when user is available
  useEffect(() => {
    if (user) {
      GetFavSRMList();
    }
  }, [user]);

  return (
    <View style={{ padding: 20, marginTop: 20, backgroundColor: colors.background, flex: 1 }}>
      <Text style={{ fontFamily: 'outfit-med', fontSize: 30, color: colors.text }}>Favourites</Text>

      {FavSRMList.length === 0 && !loader ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: colors.text }}>
          No favourites to display.
        </Text>
      ) : (
        <FlatList
          data={FavSRMList}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 0, backgroundColor: colors.background }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, margin: 10 }}>
              <SRMListItem SRM={item} />
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={<RefreshControl refreshing={loader} onRefresh={handleRefresh} />}
        />
      )}
    </View>
  );
}
