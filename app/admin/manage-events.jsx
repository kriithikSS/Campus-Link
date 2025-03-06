import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StyleSheet, Platform, Alert, ToastAndroid } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import Colors from '../../constants/Colors';
import { db, storage } from '../../config/FirebaseConfig';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import { Pressable } from 'react-native';
import { useUser } from "@clerk/clerk-expo";
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddNew() {
    const navigation = useNavigation();
    const { user } = useUser(); // ✅ Get user info
    const [formData, setFormData] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState();
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Add New'
        });
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'Category'));
            const fetchedCategories = snapshot.docs.map(doc => doc.data().name);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
    };
    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
            handleInputChange('Time', selectedDate.toISOString().split('T')[0]); // ✅ Store in formData
        }
    };
    

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert("Notice", message);
        }
    };

    const UploadImage = async () => {
        try {
            const resp = await fetch(image);
            const blobImage = await resp.blob();
            const storageRef = ref(storage, `/CampusLink/${Date.now()}.jpg`);
            
            const snapshot = await uploadBytes(storageRef, blobImage);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            showToast('Image upload failed.');
            return null;
        }
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
    
        if (!user) {
            Alert.alert("Error", "You must be logged in to add an event.");
            setIsSubmitting(false);
            return;
        }
    
        const requiredFields = ['name', 'category', 'Insta', 'Time', 'Mail', 'About'];
        const missingFields = requiredFields.filter(field => !formData[field] || formData[field].trim() === '');
    
        if (missingFields.length > 0) {
            showToast('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }
    
        try {
            // ✅ Check if a post with the same name already exists
            const snapshot = await getDocs(collection(db, 'Works'));
            const existingPosts = snapshot.docs.map(doc => doc.data().name.toLowerCase());
    
            if (existingPosts.includes(formData.name.toLowerCase())) {
                showToast('A post with this name already exists.');
                setIsSubmitting(false);
                return;
            }
    
            const imageUrl = await UploadImage();
            if (!imageUrl) {
                setIsSubmitting(false);
                return;
            }
    
            const updatedFormData = { 
                ...formData, 
                imageUrl,
                views: 0,  // 🔥 Set views to 0 when creating a new post
                adminEmail: user.primaryEmailAddress.emailAddress 
            };
    
            await addDoc(collection(db, 'Works'), updatedFormData);
            showToast('Event added successfully!');
            setFormData({});
            setImage(null);
        } catch (error) {
            console.error('❌ Failed to add event:', error);
            showToast('Failed to add event.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    
    
    
    
    return (
        <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontFamily: 'outfit-med' }}>Add New</Text>

            <Pressable onPress={imagePicker}>
                {!image ? 
                    <Image
                        source={require('./../../assets/images/add-picture-512.png')}
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 15,
                            borderWidth: 1,
                            borderColor: Colors.GRAY
                        }}
                    /> :
                    <Image source={{uri: image}}
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 15,
                        }} 
                    />}
            </Pressable>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange('name', value)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Category *</Text>
                <Picker
    selectedValue={selectedCategory}
    onValueChange={(itemValue) => {
        setSelectedCategory(itemValue);
        handleInputChange('category', itemValue); // ✅ Ensure it updates formData
    }}
    style={styles.picker}
>

                    <Picker.Item label="Select Category" value="" />
                    {categories.map((category, index) => (
                        <Picker.Item key={index} label={category} value={category} />
                    ))}
                </Picker>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Insta ID *</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange('Insta', value)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Date *</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <Text>{date.toDateString()}</Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onChangeDate}
                    />
                )}
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={(value) => handleInputChange('Mail', value)}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>About</Text>
                <TextInput
                    style={[styles.input, { height: 100 }]}
                    multiline
                    numberOfLines={5}
                    onChangeText={(value) => handleInputChange('About', value)}
                />
            </View>

            <TouchableOpacity 
    style={[styles.button, isSubmitting && { opacity: 0.5 }]} 
    onPress={onSubmit}
    disabled={isSubmitting}
>
    <Text style={{ fontFamily: 'outfit-med', textAlign: 'center' }}>
        {isSubmitting ? "Submitting..." : "Submit"}
    </Text>
</TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        marginVertical: 5
    },
    input: {
        padding: 15,
        backgroundColor: Colors.WHITE,
        borderRadius: 7,
        fontFamily: 'outfit-reg'
    },
    label: {
        marginVertical: 5,
        fontFamily: 'outfit-reg'
    },
    picker: {
        backgroundColor: Colors.WHITE,
        borderRadius: 7
    },
    button: {
        padding: 15,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 7,
        marginVertical: 10,
        marginBottom: 50
    }
});