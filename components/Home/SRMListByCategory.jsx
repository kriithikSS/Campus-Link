import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import Category from './Category'
import { collection, getDocs, query, where } from 'firebase/firestore'
import {db} from '../../config/FirebaseConfig'
import SRMListItem from './SRMListItem'

const { width } = Dimensions.get('window');

export default function SRMListByCategory() {
  const [SRMList, setSRMList] = useState([]);
  const [loader, setLoader] = useState(false);
  
  useEffect(() => {
    GetSRMList('Clubs')
  }, [])
  
  const GetSRMList = async (category) => {
    setLoader(true);
    setSRMList([]); // Clear list before fetching
  
    const q = query(collection(db, 'Works'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
  
    const fetchedList = querySnapshot.docs.map(doc => ({
      id: doc.id,  // Include Firestore document ID
      ...doc.data()
    }));
  
    setSRMList(fetchedList);
    setLoader(false);
  };
  
  return (
    <View style={styles.container}>
      <Category category={(value) => GetSRMList(value)} />
      <FlatList
        data={SRMList}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshing={loader}
        onRefresh={() => GetSRMList('Clubs')}
        renderItem={({ item }) => (
          <SRMListItem SRM={item} />
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 20,
  }
});