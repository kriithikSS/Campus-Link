import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {useAuth} from '@clerk/clerk-expo'
import Header from '../../components/Home/Header';
import Slider from '../../components/Home/Slider';
import SRMListByCategory from '../../components/Home/SRMListByCategory';
import Ionicons from '@expo/vector-icons/Ionicons';
import Colors from '../../constants/Colors';
import { TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';


export default function HomeScreen() {
    
  return (
    <View style={{
      padding:20,margin:5,marginLeft: 3,
    }}>
      {/* Header */}
        <Header/>
        
      {/*slider*/}
        <Slider/>

      {/*SRMlist + Category*/}
        <SRMListByCategory/>

      {/* Add new Event*/}
      <Link href={'/add-new-event'}
        style={styles.addEventContainer}>
      <TouchableOpacity style={styles.addEventContainer}>
      <Ionicons name="add-circle-sharp" size={39} color="black" />
      </TouchableOpacity>
      </Link>
    </View>
  );
}
const styles = StyleSheet.create({
  addEventContainer:{
    display:'flex',
    flexDirection:'row',
    gap:5,
    alignItems:'center',
    padding:4,
    marginTop:4,
    //marginLeft:115,//width:80,height:50,
    backgroundColor:Colors.highyellow,
    borderWidth:1,
    borderBlockColor:Colors.BLACK,
    borderRadius:70,
    borderStyle:'solid',
    borderWidth:2,
    height:49,
    justifyContent:'center',
    
  }
})