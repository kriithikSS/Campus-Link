import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import Colors from '../../constants/Colors';

export default function About({SRM}) {
  const [readmore,setreadmore]=useState(true);
  return (
    <View style={{
      padding:10
    }}>
      <Text style={{
        fontFamily:'outfit-med',
        fontSize:20
      }}>About {SRM?.name}</Text>
      <Text numberOfLines={readmore?3:20} style={{
        fontFamily:'outfit-reg',
        fontSize:14,
      }}>{SRM.About}</Text>
      {readmore&&
      <Pressable onPress={()=>setreadmore(false)}>
        <Text style={{
          fontFamily:'outfit-med',
          fontSize:14,
          color:Colors.BLUE
        }}>Read More</Text>
      </Pressable>}
    </View>
  )
}