import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, StyleSheet, Platform, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
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
import { Ionicons } from '@expo/vector-icons';

export default function AddNew() {
    const navigation = useNavigation();
    const { user } = useUser();
    const [formData, setFormData] = useState({ 
        formUrl: '',
        Time: new Date().toISOString().split('T')[0] // Default to current date
    });
    const [selectedCategory, setSelectedCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [image, setImage] = useState();
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Create New Event',
            headerStyle: {
                backgroundColor: Colors.PRIMARY,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontFamily: 'outfit-med',
            },
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
            showToast("Couldn't load categories. Please try again.");
        }
    };

    const imagePicker = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const validateField = (fieldName, value) => {
        let fieldErrors = {...errors};
        
        switch(fieldName) {
            case 'name':
                if (!value || value.trim() === '') {
                    fieldErrors.name = 'Event name is required';
                } else {
                    delete fieldErrors.name;
                }
                break;
            case 'category':
                if (!value || value.trim() === '') {
                    fieldErrors.category = 'Please select a category';
                } else {
                    delete fieldErrors.category;
                }
                break;
            case 'Mail':
                if (!value || value.trim() === '') {
                    fieldErrors.Mail = 'Email is required';
                } else if (!/^\S+@\S+\.\S+$/.test(value)) {
                    fieldErrors.Mail = 'Please enter a valid email';
                } else {
                    delete fieldErrors.Mail;
                }
                break;
            case 'About':
                if (!value || value.trim() === '') {
                    fieldErrors.About = 'Event description is required';
                } else {
                    delete fieldErrors.About;
                }
                break;
            case 'formUrl':
                // Only validate if a value is provided
                if (value && value.trim() !== '' && !/^https?:\/\//.test(value)) {
                    fieldErrors.formUrl = 'Please enter a valid URL';
                } else {
                    delete fieldErrors.formUrl;
                }
                break;
            case 'Insta':
                // No validation needed as it's optional
                delete fieldErrors.Insta;
                break;
        }
        
        setErrors(fieldErrors);
    };

    const handleInputChange = (fieldName, fieldValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: fieldValue
        }));
        validateField(fieldName, fieldValue);
    };

    const onChangeDate = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
            handleInputChange('Time', selectedDate.toISOString().split('T')[0]);
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
            if (!image) {
                return null;
            }
            
            const resp = await fetch(image);
            const blobImage = await resp.blob();
            const storageRef = ref(storage, `/CampusLink/${Date.now()}.jpg`);
            
            const snapshot = await uploadBytes(storageRef, blobImage);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            showToast('Image upload failed. Please try again.');
            return null;
        }
    };

    const validateForm = () => {
        // Modified to only include required fields
        const requiredFields = ['name', 'category', 'Mail', 'About'];
        let formErrors = {};
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === '') {
                formErrors[field] = `${field} is required`;
                isValid = false;
            }
        });
        
        if (!image) {
            formErrors.image = 'Please select an event image';
            isValid = false;
        }
        
        // Email validation
        if (formData.Mail && !/^\S+@\S+\.\S+$/.test(formData.Mail)) {
            formErrors.Mail = 'Please enter a valid email';
            isValid = false;
        }
        
        // URL validation (only if provided)
        if (formData.formUrl && formData.formUrl.trim() !== '' && !/^https?:\/\//.test(formData.formUrl)) {
            formErrors.formUrl = 'Please enter a valid URL';
            isValid = false;
        }
        
        setErrors(formErrors);
        return isValid;
    };

    const onSubmit = async () => {
        if (isSubmitting) return;
        
        if (!validateForm()) {
            showToast('Please fix the errors in the form');
            return;
        }
        
        if (!user) {
            Alert.alert("Error", "You must be logged in to add an event.");
            return;
        }
        
        setIsSubmitting(true);
    
        try {
            // Check if a post with the same name already exists
            const snapshot = await getDocs(collection(db, 'Works'));
            const existingPosts = snapshot.docs.map(doc => doc.data().name.toLowerCase());
    
            if (existingPosts.includes(formData.name.toLowerCase())) {
                showToast('An event with this name already exists.');
                setIsSubmitting(false);
                return;
            }
    
            const imageUrl = await UploadImage();
            if (!imageUrl) {
                setIsSubmitting(false);
                return;
            }
    
            // Ensure current date is used if no date was selected
            const finalFormData = { 
                ...formData, 
                imageUrl,
                views: 0,
                createdAt: new Date().toISOString(),
                adminEmail: user.primaryEmailAddress.emailAddress,
                // Set defaults for optional fields if they're empty
                Time: formData.Time || new Date().toISOString().split('T')[0],
                formUrl: formData.formUrl || '',
                Insta: formData.Insta || ''
            };
    
            await addDoc(collection(db, 'Works'), finalFormData);
            showToast('Event added successfully!');
            
            // Reset form after successful submission
            setFormData({});
            setImage(null);
            setSelectedCategory('');
            setDate(new Date());
            
            // Navigate back or to events list
            navigation.goBack();
        } catch (error) {
            console.error('Failed to add event:', error);
            showToast('Failed to add event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <ScrollView style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.headerText}>Create a New Event</Text>
                <Text style={styles.subHeaderText}>Fill in the details below to create your event</Text>

                <View style={styles.imageSection}>
                    <Text style={styles.sectionTitle}>Event Image</Text>
                    <Pressable 
                        onPress={imagePicker}
                        style={[styles.imagePicker, image && styles.imagePickerWithImage]}
                    >
                        {!image ? (
                            <View style={styles.imagePrompt}>
                                <Ionicons name="camera" size={40} color={Colors.GRAY} />
                                <Text style={styles.imagePromptText}>Tap to add event image</Text>
                                <Text style={styles.imageHintText}>Recommended: 16:9 ratio</Text>
                            </View>
                        ) : (
                            <Image 
                                source={{uri: image}}
                                style={styles.previewImage} 
                            />
                        )}
                    </Pressable>
                    {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Event Name *</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            onChangeText={(value) => handleInputChange('name', value)}
                            value={formData.name || ''}
                            placeholder="Enter event name"
                            placeholderTextColor={Colors.GRAY}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Category *</Text>
                        <View style={[styles.pickerContainer, errors.category && styles.inputError]}>
                            <Picker
                                selectedValue={selectedCategory}
                                onValueChange={(itemValue) => {
                                    setSelectedCategory(itemValue);
                                    handleInputChange('category', itemValue);
                                }}
                                style={styles.picker}
                            >
                                <Picker.Item label="Select Category" value="" />
                                {categories.map((category, index) => (
                                    <Picker.Item key={index} label={category} value={category} />
                                ))}
                            </Picker>
                        </View>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Google Form URL (Optional)</Text>
                        <TextInput
                            style={[styles.input, errors.formUrl && styles.inputError]}
                            onChangeText={(value) => handleInputChange('formUrl', value)}
                            value={formData.formUrl || ''}
                            placeholder="https://forms.google.com/..."
                            placeholderTextColor={Colors.GRAY}
                            keyboardType="url"
                            autoCapitalize="none"
                        />
                        {errors.formUrl && <Text style={styles.errorText}>{errors.formUrl}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Instagram Handle (Optional)</Text>
                        <View style={styles.socialInputContainer}>
                            <Text style={styles.socialPrefix}>@</Text>
                            <TextInput
                                style={styles.socialInput}
                                onChangeText={(value) => handleInputChange('Insta', value)}
                                value={formData.Insta || ''}
                                placeholder="instagram_handle"
                                placeholderTextColor={Colors.GRAY}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Event Date (Optional)</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDatePicker(true)} 
                            style={styles.input}
                        >
                            <View style={styles.dateContainer}>
                                <Ionicons name="calendar" size={20} color={Colors.GRAY} />
                                <Text style={styles.dateText}>{date.toDateString()}</Text>
                            </View>
                        </TouchableOpacity>

                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={onChangeDate}
                                minimumDate={new Date()}
                            />
                        )}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Contact Email *</Text>
                        <TextInput
                            style={[styles.input, errors.Mail && styles.inputError]}
                            onChangeText={(value) => handleInputChange('Mail', value)}
                            value={formData.Mail || ''}
                            placeholder="email@example.com"
                            placeholderTextColor={Colors.GRAY}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.Mail && <Text style={styles.errorText}>{errors.Mail}</Text>}
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Event Description *</Text>
                        <TextInput
                            style={[styles.textArea, errors.About && styles.inputError]}
                            multiline
                            numberOfLines={5}
                            onChangeText={(value) => handleInputChange('About', value)}
                            value={formData.About || ''}
                            placeholder="Describe your event..."
                            placeholderTextColor={Colors.GRAY}
                            textAlignVertical="top"
                        />
                        {errors.About && <Text style={styles.errorText}>{errors.About}</Text>}
                    </View>
                </View>

                <TouchableOpacity 
                    style={[styles.button, isSubmitting && styles.buttonDisabled]} 
                    onPress={onSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <View style={styles.buttonContentLoading}>
                            <ActivityIndicator size="small" color="#FFF" />
                            <Text style={styles.buttonTextLoading}>Creating Event...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Create Post</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    formContainer: {
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontFamily: 'outfit-med',
        marginBottom: 8,
        color: '#222',
    },
    subHeaderText: {
        fontSize: 16,
        fontFamily: 'outfit-reg',
        color: '#666',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'outfit-med',
        marginBottom: 12,
        color: '#333',
    },
    imageSection: {
        marginBottom: 24,
    },
    imagePicker: {
        height: 200,
        borderRadius: 12,
        backgroundColor: '#f1f3f5',
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePickerWithImage: {
        borderStyle: 'solid',
        borderColor: Colors.PRIMARY,
    },
    imagePrompt: {
        alignItems: 'center',
    },
    imagePromptText: {
        fontFamily: 'outfit-med',
        fontSize: 16,
        color: Colors.GRAY,
        marginTop: 12,
    },
    imageHintText: {
        fontFamily: 'outfit-reg',
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    formSection: {
        marginBottom: 24,
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
        fontFamily: 'outfit-med',
        fontSize: 16,
        color: '#444',
    },
    input: {
        padding: 14,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        fontFamily: 'outfit-reg',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    pickerContainer: {
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
    },
    textArea: {
        padding: 14,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        fontFamily: 'outfit-reg',
        fontSize: 16,
        height: 120,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    socialInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    socialPrefix: {
        paddingLeft: 14,
        fontFamily: 'outfit-med',
        fontSize: 16,
        color: '#666',
    },
    socialInput: {
        flex: 1,
        padding: 14,
        fontFamily: 'outfit-reg',
        fontSize: 16,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        fontFamily: 'outfit-reg',
        fontSize: 16,
    },
    inputError: {
        borderColor: '#e74c3c',
    },
    errorText: {
        color: '#e74c3c',
        fontFamily: 'outfit-reg',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
    button: {
        padding: 16,
        backgroundColor: Colors.PRIMARY,
        borderRadius: 10,
        marginTop: 16,
        marginBottom: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonDisabled: {
        opacity: 0.7,
        backgroundColor: '#999',
    },
    buttonText: {
        fontFamily: 'outfit-med',
        fontSize: 18,
        color: Colors.WHITE,
    },
    buttonContentLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonTextLoading: {
        fontFamily: 'outfit-med',
        fontSize: 18,
        color: Colors.WHITE,
        marginLeft: 8,
    },
});