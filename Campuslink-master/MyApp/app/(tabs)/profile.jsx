import { View, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { useAuth } from '@clerk/clerk-expo';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';

export default function Profile() {
  const Menu = [
    {
      id: 1,
      name: 'Add New Post',
      icon: 'add-circle',
      path: '/add-new-event'
    },
    {
      id: 5,
      name: 'My Post',
      icon: 'bookmark',
      path: './../user-post'
    },
    {
      id: 2,
      name: 'Favorites',
      icon: 'heart',
      path: '/(tabs)/favorite'
    },
    {
      id: 3, // Unique ID
      name: 'Inbox',
      icon: 'chatbubble',
      path: '/(tabs)/inbox'
    },
    {
      id: 4, // Unique ID
      name: 'Logout',
      icon: 'exit',
      path: 'logout'
    }
  ];

  const { user } = useUser();
  const router=useRouter();
  const {signOut}=useAuth();
  const onPressMenu=(menu)=>{
    if(menu.path ==='logout'){
      signOut();
      return;
    }
    router.push(menu.path)
  }

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfit-med', fontSize: 30 }}>Profile</Text>

      {/* User Profile Info */}
      <View style={{ display: 'flex', alignItems: 'center', marginVertical: 25 }}>
        <Image 
          source={{ uri: user?.imageUrl }} 
          style={{ width: 80, height: 80, borderRadius: 99 }} 
        />
        <Text style={{ fontFamily: 'outfit-bold', fontSize: 20, marginTop: 6 }}>
          {user?.fullName}
        </Text>
        <Text style={{ fontFamily: 'outfit-reg', fontSize: 16, color: Colors.GRAY }}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      {/* Menu List */}
      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        renderItem={({ item }) => (
          <TouchableOpacity
          onPress={()=>onPressMenu(item)}
          key={item.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 15,
              borderRadius: 10,
              backgroundColor: '#f5f5f5',
              marginVertical: 5
            }}
          >
            <Ionicons name={item.icon} size={35} color={Colors.PRIMARY}
             style={{
              padding:10,
              backgroundColor:Colors.LIGHT_PRIMARY,
              borderRadius:8  
             }}
             />
            <Text style={{ fontFamily:'outfit',fontSize: 18, marginLeft: 10 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
