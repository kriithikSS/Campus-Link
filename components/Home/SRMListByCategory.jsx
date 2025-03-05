import { View, Text, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import Category from './Category'
import { collection, getDocs, query, where } from 'firebase/firestore'
import {db} from '../../config/FirebaseConfig'
import SRMListItem from './SRMListItem'

export default function SRMListByCategory() {

  const [SRMList,setSRMList]=useState([]);
  const [loader,setLoader]=useState(false);
  useEffect(()=>{
    GetSRMList('Clubs')
  },[])
  const GetSRMList = async (category) => {
    setLoader(true);
    setSRMList([]); // Clear list before fetching
  
    const q = query(collection(db, 'Works'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
  
    const fetchedList = querySnapshot.docs.map(doc => ({
      id: doc.id,  // ✅ Include Firestore document ID
      ...doc.data()
    }));
  
    setSRMList(fetchedList);
    setLoader(false);
  };
  
  return (
    <View>
      <Category category={(value)=>GetSRMList(value)}/>
      <FlatList
  data={SRMList}
  style={{ marginTop: 10 }}
  horizontal={true}
  refreshing={loader}
  onRefresh={() => GetSRMList('Clubs')}
  renderItem={({ item }) => <SRMListItem SRM={item} />}
  keyExtractor={(item) => item.id} // ✅ Use Firestore ID as the key
/>
    </View>
  )
}