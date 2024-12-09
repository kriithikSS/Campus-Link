import { View, Text, Image, FlatList } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useUser } from '@clerk/clerk-expo'
import Colors from '../../constants/Colors'
export default function Profile() {
  const Menu=[
    {
      id:1,
      name: 'Add New Post',
      icon: 'add-circle',
      path: ''
      },
      {
      id:2,
      name: 'Favorites',
      icon: 'heart',
      path: '/(tabs)/favorite'
      },
      {
        id:1,
        name: 'Inbox',
        icon: 'chatbubble',
        path: '/(tabs)/inbox'
      },
      {
        id:1,
        name: 'Logout',
        icon: 'exit',
        path: 'logout'
      }

  ]
  const {user}=useUser();
  return (
    <View style={{
      padding:20,
      marginTop:20
    }}>
      <Text style={{
        fontFamily:'outfit-med',
        fontSize:30
      }}>Profile</Text>

      <View style={{
        display:'flex',
        alignItems:'center',
        marginVertical:25
      }}>
        <Image source={{uri:user?.imageUrl}} style={{
        width:80,
        height:80,
        borderRadius:99,}}/>

      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:20,
        marginTop:6
      }}>{user?.fullName}</Text>
      <Text style={{
        fontFamily:'outfit-reg',
        fontSize:16,
        color:Colors.GRAY
      }}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

        <FlatList
        data={Menu}
        renderItem={({item,index})=>(
          <View>
            
          </View>
        )}
        />
    </View>
  )
}