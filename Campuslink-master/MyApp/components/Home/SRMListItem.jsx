import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'
import {useRouter} from 'expo-router'
import { TouchableOpacity } from 'react-native';

export default function SRMListItem({ SRM }) {
  const router=useRouter();
  return (
    <TouchableOpacity 
    onPress={()=>router.push({
      pathname:'/SRM-details',
      params:SRM
    })}
    style={{
      padding: 10,
      marginRight: 15,
      backgroundColor: Colors.WHITE,
      borderRadius: 10,
      alignItems: 'center', // Center align items horizontally
      justifyContent: 'center', // Center align items vertically if needed
      width: 145,
      height:180 // Set a fixed width for the box
    }}>
      <Image 
        source={{ uri: SRM?.imageUrl }}
        style={{
          width: 130,
          height: 120, // Fixed height for the image
          resizeMode:'cover', // Cover the area while maintaining aspect ratio
          borderRadius: 10,
          marginBottom: 5 // Space between the image and text
        }}
      />
      <Text
        style={{
          fontFamily: 'outfit-med',
          fontSize: 17,
          textAlign: 'center', // Center the text
        }}
      >
        {SRM.name}
      </Text>
      <View style={{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between'
      }}>
      </View>
    </TouchableOpacity>
  )
}