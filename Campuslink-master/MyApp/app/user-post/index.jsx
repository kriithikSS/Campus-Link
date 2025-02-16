import { View, Text } from 'react-native'
import React from 'react'
import { useNavigation } from 'expo-router'
import { collection, query } from 'firebase/firestore';

export default function UserPost() {
    const navigation=useNavigation();
    const {user}=useUser();
    useEffect(()=>{
        navigation.setOptions({
            headerTitle:'User Post'
        })
    },[]);

    const GetUserPost=()=>{
        const q=query(collection(db,'SRM'),where('Mail','==',user?.primaryEmailAddress?.))
    }
    
    return (
    <View style={{
        padding:20
    }}> 
      <Text>UserPost</Text>

    </View>
  )
}