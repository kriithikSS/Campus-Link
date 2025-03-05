import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react'
import Colors from '../../constants/Colors'
import {useRouter} from 'expo-router'

export default function SRMListItem({ SRM }) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      onPress={() => {
        console.log("✅ Navigating with:", SRM); // Debugging
        router.push({
          pathname: '/SRM-details',
          params: {
            name: SRM.name,
            imageUrl: encodeURIComponent(SRM.imageUrl),//explicit declaration
            About: SRM.About, // ✅ Ensure About is passed
            Insta: SRM.Insta,
            Time: SRM.Time,
            Mail: SRM.Mail
          }
        });
      }}
      style={{
        padding: 10,
        marginRight: 15,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 145,
        height: 180
      }}>
      <Image 
        source={{ uri: SRM?.imageUrl }}
        style={{
          width: 130,
          height: 120,
          resizeMode: 'cover',
          borderRadius: 10,
          marginBottom: 5
        }}
      />
      <Text
        style={{
          fontFamily: 'outfit-med',
          fontSize: 17,
          textAlign: 'center',
        }}
      >
        {SRM.name}
      </Text>
    </TouchableOpacity>
  );
}
