import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'
import SRMSubinfoCard from './SRMSubinfoCard'

export default function SRMsubinfo({SRM}) {
  return (
    <View style={{
      paddingHorizontal:4
    }}>
      <View style={{
        display:'flex',
        flexDirection:'row'
      }}>
        <SRMSubinfoCard 
        icon={require('./../../assets/images/instagram-icon.png')}
        title={'ID'}
        value={SRM?.Insta}
        />
        <SRMSubinfoCard 
        icon={require('./../../assets/images/calender1.png')}
        title={'Time'}
        value={SRM?.Time}/>
      </View>
      <View style={{
        display:'flex',
        flexDirection:'row'
      }}>
        <SRMSubinfoCard 
        icon={require('./../../assets/images/gmail.png')}
        title={'Email'}
        value={SRM?.Mail}
        />
      </View>
      {/*If you want to add more box copy before*/}
    </View>
    
  )
}