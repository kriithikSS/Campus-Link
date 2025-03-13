import { View, Text, Image } from 'react-native';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import MarkFav from '../MarkFav';

export default function SRMinfo({ SRM }) {
  const { colors, isDarkMode } = useTheme();

  return (
    <View>
      <Image 
        source={{ uri: SRM.imageUrl }}
        style={{
          width: '100%',
          height: 300,
          objectFit: 'cover'
        }}
      />
      
      <View style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background // 🔥 Adapt to Dark Mode
      }}>
        <View>
          <Text style={{
            fontFamily: 'outfit-bold',
            fontSize: 23,
            color: colors.text // 🔥 Adapt text color to theme
          }}>
            {SRM?.name}
          </Text>
        </View>
        <MarkFav SRM={SRM}/>
      </View>
    </View>
  );
}
