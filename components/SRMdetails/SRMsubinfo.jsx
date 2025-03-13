import { View, Linking } from 'react-native';
import React from 'react';
import SRMSubinfoCard from './SRMSubinfoCard';

export default function SRMsubinfo({ SRM }) {
  
  // Function to open Instagram Profile
  const openInstagram = () => {
    if (SRM?.Insta) {
      const instaUsername = SRM.Insta.replace('@', ''); // Remove @ if included
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

  return (
    <View style={{ paddingHorizontal: 4 }}>
      <View style={{ flexDirection: 'row' }}>
        <SRMSubinfoCard 
          icon={require('./../../assets/images/instagram-icon.png')}
          title={'Instagram'}
          value={SRM?.Insta}
          onPress={openInstagram} // ✅ Clickable Instagram ID
        />
        <SRMSubinfoCard 
          icon={require('./../../assets/images/calender1.png')}
          title={'Event'}
          value={SRM?.Time}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        <SRMSubinfoCard 
          icon={require('./../../assets/images/gmail.png')}
          title={'Email'}
          value={SRM?.Mail}
          onPress={openEmail} // ✅ Clickable Email
        />
      </View>
    </View>
  );
}
