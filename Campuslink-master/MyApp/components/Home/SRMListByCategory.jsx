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
  const GetSRMList=async(category)=>{
    setLoader(true)
    setSRMList([]);
    const q=query(collection(db,'Works'),where('category','==',category));
    const querySnapshot=await getDocs(q);

    querySnapshot.forEach(doc=>{
      setSRMList(SRMList=>[...SRMList,doc.data()])
    })
    setLoader(false);
  }
  return (
    <View>
      <Category category={(value)=>GetSRMList(value)}/>
      <FlatList
        data={SRMList}
        style={{marginTop:10}}
        horizontal={true}
        refreshing={loader}
        onRefresh={()=>GetSRMList('Clubs')}
        renderItem={({item,index})=>(
          <SRMListItem SRM={item}/>
        )}
      />
    </View>
  )
}