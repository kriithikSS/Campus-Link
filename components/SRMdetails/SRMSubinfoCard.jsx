import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';

export default function SRMSubinfoCard({ icon, title, value, onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={!onPress} 
      activeOpacity={0.7}
      style={{ flex: 1 }}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        padding: 12,
        margin: 5,
        borderRadius: 8,
        height: 70,
        gap: 10,
        flex: 1
      }}>
        <Image 
          source={icon} 
          style={{ 
            width: 40, // ✅ Standardized icon size
            height: 40,
            resizeMode: 'contain'
          }} 
        />
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontFamily: 'outfit-reg', 
            fontSize: 16, 
            color: Colors.GRAY 
          }}>
            {title}
          </Text>
          <Text style={{
            fontFamily: 'outfit-med', 
            fontSize: 16,
            color: onPress ? 'blue' : 'black' // ✅ Clickable text in blue
          }}>
            {value}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
