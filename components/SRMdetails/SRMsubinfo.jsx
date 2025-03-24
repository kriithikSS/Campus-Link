import { View, Linking, StyleSheet } from 'react-native';
import React from 'react';
import SRMSubinfoCard from './SRMSubinfoCard';
import { useTheme } from '../../context/ThemeContext';

export default function SRMsubinfo({ SRM }) {
  const { colors, isDarkMode } = useTheme();
  
  // Function to open Instagram Profile
  const openInstagram = () => {
    if (SRM?.Insta) {
      const instaUsername = SRM.Insta.replace('@', ''); 
      const instagramUrl = `https://www.instagram.com/${instaUsername}/`;

      Linking.openURL(instagramUrl).catch(err => 
        console.error("❌ Failed to open Instagram:", err)
      );
    }
  };

  // Function to open Email App
  const openEmail = () => {
    if (SRM?.Mail) {
      const emailUrl = `mailto:${SRM.Mail}`;

      Linking.openURL(emailUrl).catch(err => 
        console.error("❌ Failed to open Email App:", err)
      );
    }
  };

  // Function to open WhatsApp
  const openWhatsApp = () => {
    if (SRM?.WhatsApp) {
      const phoneNumber = SRM.WhatsApp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${phoneNumber}`;

      Linking.openURL(whatsappUrl).catch(err => 
        console.error("❌ Failed to open WhatsApp:", err)
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <SRMSubinfoCard 
          icon={require('./../../assets/images/instagram-icon.png')}
          title={'Instagram'}
          value={SRM?.Insta}
          onPress={openInstagram}
          themeColors={colors}
          isDarkMode={isDarkMode}
        />
        <SRMSubinfoCard 
          icon={require('./../../assets/images/calender1.png')}
          title={'Event Date'}
          value={SRM?.Time}
          themeColors={colors}
          isDarkMode={isDarkMode}
        />
      </View>
      <View style={styles.row}>
        <SRMSubinfoCard 
          icon={require('./../../assets/images/gmail.png')}
          title={'Email'}
          value={SRM?.Mail}
          onPress={openEmail}
          themeColors={colors}
          isDarkMode={isDarkMode}
        />
        <SRMSubinfoCard 
          icon={require('./../../assets/images/whatsapp-icon.png')}
          title={'WhatsApp'}
          value={SRM?.WhatsApp}
          onPress={openWhatsApp}
          themeColors={colors}
          isDarkMode={isDarkMode}
        />
      </View>
      <View style={styles.row}>
        <SRMSubinfoCard 
          icon={require('./../../assets/images/price-tag.webp')}
          title={'Price'}
          value={SRM?.Price}
          highlighted={true}
          themeColors={colors}
          isDarkMode={isDarkMode}
        />
        {SRM?.Location && (
          <SRMSubinfoCard 
            icon={require('./../../assets/images/location-pin.png')}
            title={'Location'}
            value={SRM?.Location}
            themeColors={colors}
            isDarkMode={isDarkMode}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  }
});