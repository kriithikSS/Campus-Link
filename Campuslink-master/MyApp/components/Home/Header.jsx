import { View, Text } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-react';
import { Image } from 'react-native';

export default function Header() {
    const {user} = useUser();
  return (
    <View style={{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      marginLeft:1,
    }}>
      <View>
        <Text style={{
          fontFamily:'outfit-reg',
          fontSize:18
        }}>Welcome</Text>
        <Text style={{
          fontFamily:'outfit-med',
          fontSize:25
        }}>{user?.fullName}</Text>
      </View>
      <Image source={{uri:user?.imageUrl}} style={{
        width:55,
        height:55,
        borderRadius:80,
      }}/>
    </View>
  )
}