import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, ActivityIndicator, 
  Alert, TouchableOpacity, Modal, TextInput, SafeAreaView, ScrollView, Platform, ToastAndroid 
} from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/FirebaseConfig';
import { useUser } from "@clerk/clerk-expo";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from "../../constants/Colors";
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';

export default function UserManagement() {
    const { user } = useUser(); 
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [updatedData, setUpdatedData] = useState({});
    const [image, setImage] = useState(null);

    useEffect(() => {
        fetchAdminEvents();
        fetchCategories();
    }, []);

    const fetchAdminEvents = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const q = query(collection(db, "Works"), where("adminEmail", "==", user.primaryEmailAddress.emailAddress));
            const querySnapshot = await getDocs(q);

            const adminEvents = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setEvents(adminEvents);
        } catch (error) {
            console.error("Error fetching admin events:", error);
            Alert.alert("Error", "Failed to fetch events.");
        }

        setLoading(false);
    };

    const fetchCategories = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'Category'));
            const fetchedCategories = snapshot.docs.map(doc => doc.data().name);
            setCategories(fetchedCategories);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const showToast = (message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert("Notice", message);
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

    const UploadImage = async () => {
        if (!image) return updatedData.imageUrl;

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

    const handleDelete = async (eventId) => {
        Alert.alert(
            "Confirm Deletion", 
            "Are you sure you want to delete this event?", 
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "Works", eventId));
                            setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
                            showToast("Event deleted successfully.");
                        } catch (error) {
                            console.error("Error deleting event:", error);
                            showToast("Failed to delete event.");
                        }
                    },
                    style: "destructive",
                },
            ]
        );
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setUpdatedData(event);
        setImage(event.imageUrl);
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!selectedEvent) return;

        const requiredFields = ['name', 'category', 'instaId', 'date', 'email', 'about'];
        const missingFields = requiredFields.filter(field => !updatedData[field] || updatedData[field].trim() === '');

        if (missingFields.length > 0) {
            showToast('Please fill in all required fields.');
            return;
        }

        try {
            const imageUrl = await UploadImage();
            if (!imageUrl) return;

            const updatedEventData = { 
                ...updatedData, 
                imageUrl,
                adminEmail: user.primaryEmailAddress.emailAddress
            };

            const eventRef = doc(db, "Works", selectedEvent.id);
            await updateDoc(eventRef, updatedEventData);
            
            setEvents(events.map(event => event.id === selectedEvent.id ? updatedEventData : event));
            
            showToast('Event updated successfully!');
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating event:", error);
            showToast('Failed to update event.');
        }
    };

    const renderEventCard = ({ item }) => (
        <Animated.View 
            entering={FadeIn} 
            exiting={FadeOut} 
            style={styles.eventCardContainer}
        >
            <View style={styles.eventCard}>
                <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.eventImage} 
                    defaultSource={require('../../assets/placeholder-image.png')} 
                />
                <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.categoryText}>
                        <Ionicons name="pricetag-outline" size={14} color={Colors.PRIMARY} /> 
                        {item.category}
                    </Text>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={styles.editButton} 
                            onPress={() => handleEdit(item)}
                        >
                            <Ionicons name="create-outline" size={18} color="white" />
                            <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.deleteButton} 
                            onPress={() => handleDelete(item.id)}
                        >
                            <Ionicons name="trash-outline" size={18} color="white" />
                            <Text style={styles.buttonText}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Animated.View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerGradient}>
                <Text style={styles.screenTitle}>My Events</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            ) : events.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <Ionicons name="calendar-outline" size={84} color={Colors.GRAY} />
                    <Text style={styles.emptyStateText}>No events created yet</Text>
                    <Text style={styles.emptyStateSubtext}>Start by creating your first event</Text>
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventCard}
                    contentContainerStyle={styles.eventList}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Edit Modal */}
            <Modal 
                visible={modalVisible} 
                animationType="slide" 
                transparent={true}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>Edit Event</Text>

                            {/* Image Picker */}
                            <TouchableOpacity onPress={imagePicker}>
                                {!image ? 
                                    <Image
                                        source={require('../../assets/images/add-picture-512.png')}
                                        style={styles.imagePicker}
                                    /> :
                                    <Image 
                                        source={{uri: image}}
                                        style={styles.imagePicker} 
                                    />
                                }
                            </TouchableOpacity>

                            {/* Name */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={updatedData.name}
                                    onChangeText={(value) => setUpdatedData(prev => ({...prev, name: value}))}
                                />
                            </View>

                            {/* Category */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Category *</Text>
                                <Picker
                                    selectedValue={updatedData.category}
                                    onValueChange={(itemValue) => setUpdatedData(prev => ({...prev, category: itemValue}))}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Category" value="" />
                                    {categories.map((category, index) => (
                                        <Picker.Item key={index} label={category} value={category} />
                                    ))}
                                </Picker>
                            </View>

                            {/* Instagram ID */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Insta ID *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={updatedData.instaId}
                                    onChangeText={(value) => setUpdatedData(prev => ({...prev, instaId: value}))}
                                />
                            </View>

                            {/* Date */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Date *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={updatedData.date}
                                    onChangeText={(value) => setUpdatedData(prev => ({...prev, date: value}))}
                                />
                            </View>

                            {/* Email */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={updatedData.email}
                                    onChangeText={(value) => setUpdatedData(prev => ({...prev, email: value}))}
                                />
                            </View>

                            {/* About */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>About</Text>
                                <TextInput
                                    style={[styles.input, { height: 100 }]}
                                    multiline
                                    numberOfLines={5}
                                    value={updatedData.about}
                                    onChangeText={(value) => setUpdatedData(prev => ({...prev, about: value}))}
                                />
                            </View>

                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.updateButton]} 
                                    onPress={handleUpdate}
                                >
                                    <Ionicons name="save-outline" size={20} color="white" />
                                    <Text style={styles.buttonText}>Update</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]} 
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Ionicons name="close-outline" size={20} color="white" />
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.BACKGROUND 
    },
    headerGradient: {
        backgroundColor: Colors.PRIMARY,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    screenTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: 'white',
        textAlign: 'center'
    },
    eventCardContainer: {
        marginVertical: 10,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
    },
    eventImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 15
    },
    eventDetails: {
        flex: 1,
        justifyContent: 'center'
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5
    },
    categoryText: {
        color: Colors.PRIMARY,
        marginBottom: 10,
        alignItems: 'center'
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    editButton: {
        backgroundColor: Colors.PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 7,
        flex: 1,
        marginRight: 5,
        justifyContent: 'center'
    },
    deleteButton: {
        backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 7,
        flex: 1,
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white', 
        marginLeft: 5,
        fontWeight: 'bold'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    inputLabel: {
        marginBottom: 5,
        color: Colors.PRIMARY,
        fontWeight: 'bold'
    },
    input: {
        backgroundColor: '#F0F4F8',
        padding: 12,
        borderRadius: 10,
        marginBottom: 15
    },
    pickerContainer: {
        backgroundColor: '#F0F4F8',
        borderRadius: 10,
        marginBottom: 15
    },
    picker: {
        height: 50
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    modalButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 5
    },
    updateButton: {
        backgroundColor: Colors.PRIMARY
    },
    cancelButton: {
        backgroundColor: 'red'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyStateText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15
    },
    emptyStateSubtext: {
        color: Colors.GRAY,
        marginTop: 5
    }
});