import { View, Text, Pressable } from 'react-native';
import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function About({ SRM }) {
  const [readmore, setReadMore] = useState(true);
  const { colors, isDarkMode } = useTheme();

  return (
    <View style={{ padding: 10 }}>
      <Text style={{
        fontFamily: 'outfit-med',
        fontSize: 20,
        color: colors.text
      }}>
        About {SRM?.name}
      </Text>

      <Text numberOfLines={readmore ? 3 : 20} style={{
        fontFamily: 'outfit-reg',
        fontSize: 14,
        color: colors.text
      }}>
        {SRM.About}
      </Text>

      {readmore && (
        <Pressable onPress={() => setReadMore(false)}>
          <Text style={{
            fontFamily: 'outfit-med',
            fontSize: 14,
            color: colors.primary
          }}>
            Read More
          </Text>
        </Pressable>
      )}
    </View>
  );
}
