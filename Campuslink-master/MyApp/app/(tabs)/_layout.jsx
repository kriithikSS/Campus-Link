import { View, Text } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Colors from "../../constants/Colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabsLayout() {
  return (
    <Tabs
    screenOptions={{tabBarActiveTintColor:Colors.BLACK}}>
      <Tabs.Screen name="home" options={{ title: 'Home',headerShown:false,
        tabBarIcon:({color})=><Feather name="home" size={24} color={color}/>
       }} />
      
      <Tabs.Screen name="favorite" options={{ title: 'favourite',headerShown:false,
        tabBarIcon:({color})=><MaterialIcons name="favorite" size={24} color={color} />
      }} />
      
      <Tabs.Screen name="inbox" options={{ title: 'Inbox',headerShown:false,
        tabBarIcon:({color})=><MaterialCommunityIcons name="message-bulleted" size={26} color={color} />
       }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile',headerShown:false,
        tabBarIcon:({color})=><FontAwesome6 name="face-laugh-wink" size={26} color={color} />
       }} />
    </Tabs>
  );
}
