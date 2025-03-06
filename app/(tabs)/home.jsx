import { StyleSheet, Text, View, ScrollView, SafeAreaView } from 'react-native';
import React from 'react';
import {useAuth} from '@clerk/clerk-expo'
import Header from '../../components/Home/Header';
import Slider from '../../components/Home/Slider';
import SRMListByCategory from '../../components/Home/SRMListByCategory';
import Colors from '../../constants/Colors';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Header/>
        
        {/* Slider */}
        <Slider/>

        {/* SRMlist + Category - This will handle its own scrolling */}
        <View style={styles.listContainer}>
          <SRMListByCategory/>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 0,
  },
  listContainer: {
    flex: 1,
  }
});