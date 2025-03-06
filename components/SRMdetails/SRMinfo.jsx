import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'
import MarkFav from '../MarkFav';

export default function SRMinfo({SRM}) {
  return (
    <View>
      <Image source={{uri:SRM.imageUrl}}
      style={{
        width:'100%',
        height:300,
        objectFit:'cover'
      }}
      />
      <View style={{
        padding:20,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',

      }}>
        <View>
          <Text style={{
            fontFamily:'outfit-bold',
            fontSize:23
          }}>{SRM?.name}</Text>
          
        </View>
        <MarkFav SRM={SRM}/>
      </View>
    </View>
  )
}