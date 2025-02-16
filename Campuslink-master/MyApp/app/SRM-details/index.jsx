import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams, useNavigation } from 'expo-router'
import SRMinfo from '../../components/SRMdetails/SRMinfo';
import SRMsubinfo from '../../components/SRMdetails/SRMsubinfo';
import About from '../../components/SRMdetails/About';
import Ownerinfo from '../../components/SRMdetails/Ownerinfo';
import Colors from '../../constants/Colors';

export default function SRMdetails() {
  const SRM=useLocalSearchParams();
  const navigation=useNavigation();

  useEffect(()=>{
      navigation.setOptions({
        headerTransparent:true,
        headerTitle:''
      })
  },[])
  return (
    <View>
      <ScrollView>
      {/* SRM Info*/}
          <SRMinfo SRM={SRM}/>
      {/* SRM subinfo*/}
        <SRMsubinfo SRM={SRM}/>
      {/*About*/}
        <About SRM={SRM}/>
      {/*Owner Details*/}
        <Ownerinfo SRM={SRM}/>

        <View style={{height:70}}>

        </View>
      </ScrollView>
      {/*contact/join us button*/}
      <View style={styles?.bottomContainer}>
        <TouchableOpacity style={styles.applybtn}>
          <Text style={{
            textAlign:'center',
            fontFamily:'outfit-med',
            fontSize:20
          }}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  applybtn:{
      padding:15,
      backgroundColor:Colors.PRIMARY
  },
  bottomContainer:{
      position:'absolute',
      width:'100%',
      bottom:0 
  }
})