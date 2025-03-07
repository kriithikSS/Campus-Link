import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import React from 'react'
import Colors from '../../constants/Colors'
import {useRouter} from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const itemWidth = (width - 50) / 2; // Account for padding and gap

export default function SRMListItem({ SRM }) {
  const router = useRouter();

  return (
    <TouchableOpacity 
      onPress={() => {
        console.log("✅ Navigating with Firestore Doc ID:", SRM.id);
        router.push({
          pathname: '/SRM-details',
          params: {
            id: SRM.id,
            name: SRM.name,
            imageUrl: encodeURIComponent(SRM.imageUrl),
            About: SRM.About,
            Insta: SRM.Insta,
            Time: SRM.Time,
            Mail: SRM.Mail
          }
        });
      }}
      style={styles.container}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: SRM?.imageUrl }}
          style={styles.image}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {SRM.name}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{SRM.category}</Text>
          </View>
          
          <TouchableOpacity style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: itemWidth,
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
  detailsContainer: {
    padding: 12,
  },
  name: {
    fontFamily: 'outfit-med',
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  categoryTag: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: 'outfit-reg',
    fontSize: 10,
    color: '#64748B',
  },
  infoButton: {
    padding: 4,
  }
});