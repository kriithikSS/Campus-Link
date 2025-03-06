import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, FlatList, Image, StyleSheet, ActivityIndicator, 
  Alert, TouchableOpacity, Modal, TextInput, SafeAreaView, 
  ScrollView, Platform, ToastAndroid, RefreshControl 
} from 'react-native';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../config/FirebaseConfig';
import { useUser } from "@clerk/clerk-expo";
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from "../../constants/Colors";
import Animated, { FadeIn, FadeOut, SlideInRight } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { ref, getDownloadURL, uploadBytes } from 'firebase/storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function UserManagement() {
    const { user } = useUser(); 
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [updatedData, setUpdatedData] = useState({});
    const [image, setImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

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

            adminEvents.sort((a, b) => {
                // Sort by date (newest first)
                return new Date(b.date) - new Date(a.date);
            });

            setEvents(adminEvents);
        } catch (error) {
            console.error("Error fetching admin events:", error);
            showToast("Failed to fetch events", true);
        }

        setLoading(false);
        setRefreshing(false);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAdminEvents();
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

    const showToast = (message, isError = false) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(isError ? "Error" : "Success", message);
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
        if (image === updatedData.imageUrl) return image;

        try {
            const resp = await fetch(image);
            const blobImage = await resp.blob();
            const storageRef = ref(storage, `/CampusLink/${Date.now()}.jpg`);
            
            const snapshot = await uploadBytes(storageRef, blobImage);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            return downloadUrl;
        } catch (error) {
            console.error('Image upload failed:', error);
            showToast('Image upload failed', true);
            return null;
        }
    };

    const handleDelete = (eventId) => {
        setConfirmDelete(eventId);
    };

    const confirmDeleteAction = async () => {
        if (!confirmDelete) return;
        
        try {
            await deleteDoc(doc(db, "Works", confirmDelete));
            setEvents((prevEvents) => prevEvents.filter(event => event.id !== confirmDelete));
            showToast("Event deleted successfully");
        } catch (error) {
            console.error("Error deleting event:", error);
            showToast("Failed to delete event", true);
        }
        
        setConfirmDelete(null);
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setUpdatedData({...event});
        setImage(event.imageUrl);
        setModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!selectedEvent) return;

        const requiredFields = ['name', 'category', 'instaId', 'date', 'email', 'about'];
        const missingFields = requiredFields.filter(field => !updatedData[field] || updatedData[field].trim() === '');

        if (missingFields.length > 0) {
            showToast(`Please fill in all required fields: ${missingFields.join(', ')}`, true);
            return;
        }

        setIsSubmitting(true);

        try {
            const imageUrl = await UploadImage();
            if (!imageUrl) {
                setIsSubmitting(false);
                return;
            }

            const updatedEventData = { 
                ...updatedData, 
                imageUrl,
                adminEmail: user.primaryEmailAddress.emailAddress,
                lastUpdated: new Date().toISOString()
            };

            const eventRef = doc(db, "Works", selectedEvent.id);
            await updateDoc(eventRef, updatedEventData);
            
            setEvents(events.map(event => event.id === selectedEvent.id ? 
                {...updatedEventData, id: event.id} : event));
            
            showToast('Event updated successfully!');
            setModalVisible(false);
        } catch (error) {
            console.error("Error updating event:", error);
            showToast('Failed to update event', true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setUpdatedData(prev => ({...prev, date: formattedDate}));
        }
    };

    const filteredEvents = events.filter(event => 
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderEventCard = ({ item, index }) => (
        <Animated.View 
            entering={SlideInRight.delay(index * 100)} 
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
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.PRIMARY} />
                        <Text style={styles.infoText}>{item.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="pricetag-outline" size={14} color={Colors.PRIMARY} /> 
                        <Text style={styles.infoText}>{item.category}</Text>
                    </View>
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
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="white" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search events..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                    <Text style={styles.loadingText}>Loading your events...</Text>
                </View>
            ) : filteredEvents.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    {searchQuery.length > 0 ? (
                        <>
                            <Ionicons name="search" size={84} color={Colors.GRAY} />
                            <Text style={styles.emptyStateText}>No matching events found</Text>
                            <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
                        </>
                    ) : (
                        <>
                            <Ionicons name="calendar-outline" size={84} color={Colors.GRAY} />
                            <Text style={styles.emptyStateText}>No events created yet</Text>
                            <Text style={styles.emptyStateSubtext}>Start by creating your first event</Text>
                        </>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEventCard}
                    contentContainerStyle={styles.eventList}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.PRIMARY]}
                        />
                    }
                />
            )}

            {/* Edit Modal */}
            <Modal 
                visible={modalVisible} 
                animationType="slide" 
                transparent={true}
                statusBarTranslucent
            >
                <KeyboardAwareScrollView 
                    contentContainerStyle={styles.modalOverlay}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Event</Text>
                            <TouchableOpacity 
                                style={styles.closeButton} 
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close-circle" size={28} color={Colors.GRAY} />
                            </TouchableOpacity>
                        </View>

                        {/* Image Picker */}
                        <TouchableOpacity 
                            onPress={imagePicker}
                            style={styles.imagePickerContainer}
                        >
                            {!image ? (
                                <View style={styles.imagePickerPlaceholder}>
                                    <Ionicons name="image-outline" size={40} color={Colors.PRIMARY} />
                                    <Text style={styles.imagePickerText}>Add Image</Text>
                                </View>
                            ) : (
                                <View style={styles.imagePickerWrapper}>
                                    <Image 
                                        source={{uri: image}}
                                        style={styles.imagePicker} 
                                    />
                                    <View style={styles.imageOverlay}>
                                        <Ionicons name="camera" size={24} color="white" />
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Form Fields */}
                        <View style={styles.formContainer}>
                            {/* Name */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    Event Name <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="text-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={updatedData.name}
                                        onChangeText={(value) => setUpdatedData(prev => ({...prev, name: value}))}
                                        placeholder="Enter event name"
                                    />
                                </View>
                            </View>

                            {/* Category */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    Category <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={styles.pickerWrapper}>
                                    <Ionicons name="pricetag-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
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
                            </View>

                            {/* Instagram ID */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    Instagram ID <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="logo-instagram" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={updatedData.instaId}
                                        onChangeText={(value) => setUpdatedData(prev => ({...prev, instaId: value}))}
                                        placeholder="Enter Instagram ID"
                                    />
                                </View>
                            </View>

                            {/* Date */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    Date <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <TouchableOpacity 
                                    style={styles.inputWrapper}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                                    <Text style={styles.dateInput}>
                                        {updatedData.date || "Select date"}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={updatedData.date ? new Date(updatedData.date) : new Date()}
                                        mode="date"
                                        display="default"
                                        onChange={handleDateChange}
                                    />
                                )}
                            </View>

                            {/* Email */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    Contact Email <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={styles.inputWrapper}>
                                    <Ionicons name="mail-outline" size={20} color={Colors.PRIMARY} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={updatedData.email}
                                        onChangeText={(value) => setUpdatedData(prev => ({...prev, email: value}))}
                                        placeholder="Enter contact email"
                                        keyboardType="email-address"
                                    />
                                </View>
                            </View>

                            {/* About */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>
                                    About <Text style={styles.requiredStar}>*</Text>
                                </Text>
                                <View style={[styles.inputWrapper, {alignItems: 'flex-start'}]}>
                                    <Ionicons name="information-circle-outline" size={20} color={Colors.PRIMARY} style={[styles.inputIcon, {marginTop: 12}]} />
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                        numberOfLines={5}
                                        value={updatedData.about}
                                        onChangeText={(value) => setUpdatedData(prev => ({...prev, about: value}))}
                                        placeholder="Enter description about the event"
                                        textAlignVertical="top"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity 
                                style={[
                                    styles.modalButton, 
                                    styles.updateButton,
                                    isSubmitting && styles.disabledButton
                                ]} 
                                onPress={handleUpdate}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={20} color="white" />
                                        <Text style={styles.buttonText}>Update Event</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={confirmDelete !== null}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.confirmModalOverlay}>
                    <Animated.View 
                        entering={FadeIn} 
                        style={styles.confirmModalContent}
                    >
                        <Ionicons name="alert-circle" size={60} color="red" style={styles.alertIcon} />
                        <Text style={styles.confirmTitle}>Delete Event?</Text>
                        <Text style={styles.confirmText}>
                            This action cannot be undone. Are you sure you want to delete this event?
                        </Text>
                        <View style={styles.confirmButtonRow}>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.cancelConfirmButton]}
                                onPress={() => setConfirmDelete(null)}
                            >
                                <Text style={styles.confirmButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, styles.deleteConfirmButton]}
                                onPress={confirmDeleteAction}
                            >
                                <Text style={[styles.confirmButtonText, {color: 'white'}]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
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
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5
    },
    screenTitle: { 
        fontSize: 28, 
        fontWeight: 'bold', 
        color: 'white',
        textAlign: 'center',
        marginBottom: 15
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8
    },
    searchIcon: {
        marginRight: 8
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        paddingVertical: 0
    },
    eventList: {
        paddingVertical: 15
    },
    eventCardContainer: {
        marginVertical: 8,
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
        padding: 12,
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
        marginBottom: 8,
        color: '#333'
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    infoText: {
        marginLeft: 6,
        color: '#555',
        fontSize: 14
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5
    },
    editButton: {
        backgroundColor: Colors.PRIMARY,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        flex: 1,
        marginRight: 8,
        justifyContent: 'center'
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        flex: 1,
        justifyContent: 'center'
    },
    buttonText: {
        color: 'white', 
        marginLeft: 5,
        fontWeight: 'bold'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: Colors.PRIMARY,
        fontSize: 16
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30
    },
    emptyStateText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
        textAlign: 'center'
    },
    emptyStateSubtext: {
        color: Colors.GRAY,
        marginTop: 5,
        textAlign: 'center',
        fontSize: 16
    },
    modalOverlay: {
        flexGrow: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 30
    },
    modalContent: {
        width: '90%',
        maxWidth: 500,
        backgroundColor: 'white',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.PRIMARY
    },
    closeButton: {
        padding: 5
    },
    imagePickerContainer: {
        marginVertical: 15,
        alignItems: 'center'
    },
    imagePickerWrapper: {
        position: 'relative',
        borderRadius: 15,
        overflow: 'hidden',
    },
    imagePicker: {
        width: 200,
        height: 150,
        borderRadius: 15
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center'
    },
    imagePickerPlaceholder: {
        width: 200,
        height: 150,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9'
    },
    imagePickerText: {
        marginTop: 8,
        color: Colors.PRIMARY,
        fontWeight: '600'
    },
    formContainer: {
        marginTop: 10
    },
    inputContainer: {
        marginBottom: 15
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#444'
    },
    requiredStar: {
        color: '#FF3B30'
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E9F0'
    },
    inputIcon: {
        marginLeft: 12,
        marginRight: 8
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    pickerWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E9F0'
    },
    picker: {
        flex: 1,
        height: 50
    },
    dateInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333'
    },
    modalButtonContainer: {
        marginTop: 10
    },
    modalButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginTop: 5
    },
    updateButton: {
        backgroundColor: Colors.PRIMARY
    },
    disabledButton: {
        backgroundColor: '#999',
        opacity: 0.7
    },
    confirmModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmModalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8
    },
    alertIcon: {
        marginBottom: 15
    },
    confirmTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    confirmText: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        color: '#666',
        lineHeight: 22
    },
    confirmButtonRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between'
    },
    confirmButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    cancelConfirmButton: {
        backgroundColor: '#F2F2F7',
        borderWidth: 1,
        borderColor: '#E5E5EA'
    },
    deleteConfirmButton: {
        backgroundColor: '#FF3B30'
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold'
    }
});