import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  Platform,
  ActivityIndicator
} from 'react-native';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';
import { app } from '../../config/FirebaseConfig';

const ManageEvents = () => {
  // Initialize Firestore
  const db = getFirestore(app);
  const storage = getStorage(app);

  // State for events and form
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    imageUrl: null,
  });

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to fetch events from Firestore
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsCollection = collection(db, 'events');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events: ", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Function to add or update an event
  const handleSaveEvent = async () => {
    // Validate form
    if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = eventForm.imageUrl;

      // If we have a new image (starts with 'file:')
      if (imageUrl && imageUrl.startsWith('file:')) {
        // Upload image to Firebase Storage
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const fileRef = ref(storage, `event-images/${Date.now()}`);
        await uploadBytes(fileRef, blob);
        imageUrl = await getDownloadURL(fileRef);
      }

      const eventData = {
        ...eventForm,
        imageUrl,
        createdAt: new Date(),
      };

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        Alert.alert("Success", "Event updated successfully");
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), eventData);
        Alert.alert("Success", "Event added successfully");
      }

      // Reset form and close modal
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        imageUrl: null,
      });
      setModalVisible(false);
      setEditingEvent(null);
      fetchEvents(); // Refresh events list
    } catch (error) {
      console.error("Error saving event: ", error);
      Alert.alert("Error", "Failed to save event");
    } finally {
      setUploading(false);
    }
  };

  // Function to delete an event
  const handleDeleteEvent = async (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this event?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', id));
              fetchEvents(); // Refresh events list
              Alert.alert("Success", "Event deleted successfully");
            } catch (error) {
              console.error("Error deleting event: ", error);
              Alert.alert("Error", "Failed to delete event");
            }
          }
        }
      ]
    );
  };

  // Function to pick an image from the gallery
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setEventForm({...eventForm, imageUrl: result.assets[0].uri});
    }
  };

  // Function to edit an event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || '',
      location: event.location,
      category: event.category || '',
      imageUrl: event.imageUrl,
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Events</Text>
      <Text style={styles.subtitle}>
        Add, edit, or remove campus events
      </Text>

      {/* Add Event Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setEditingEvent(null);
          setEventForm({
            title: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: '',
            imageUrl: null,
          });
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add New Event</Text>
      </TouchableOpacity>
      
      {/* Events List */}
      <ScrollView style={styles.eventsContainer}>
        <Text style={styles.sectionTitle}>Events List</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.PRIMARY} style={styles.loader} />
        ) : events.length === 0 ? (
          <Text style={styles.emptyState}>No events found. Click "Add New Event" to create one.</Text>
        ) : (
          events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDate}>{event.date} {event.time ? `• ${event.time}` : ''}</Text>
              <Text style={styles.eventLocation}>{event.location}</Text>
              {event.category && <Text style={styles.eventCategory}>Category: {event.category}</Text>}
              
              <View style={styles.eventActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEditEvent(event)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteEvent(event.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add/Edit Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </Text>
            
            <ScrollView style={styles.formContainer}>
              <Text style={styles.inputLabel}>Event Title *</Text>
              <TextInput
                style={styles.input}
                value={eventForm.title}
                onChangeText={(text) => setEventForm({...eventForm, title: text})}
                placeholder="Enter event title"
              />
              
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={eventForm.description}
                onChangeText={(text) => setEventForm({...eventForm, description: text})}
                placeholder="Enter event description"
                multiline={true}
                numberOfLines={4}
              />
              
              <Text style={styles.inputLabel}>Date *</Text>
              <TextInput
                style={styles.input}
                value={eventForm.date}
                onChangeText={(text) => setEventForm({...eventForm, date: text})}
                placeholder="YYYY-MM-DD"
              />
              
              <Text style={styles.inputLabel}>Time</Text>
              <TextInput
                style={styles.input}
                value={eventForm.time}
                onChangeText={(text) => setEventForm({...eventForm, time: text})}
                placeholder="HH:MM AM/PM"
              />
              
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.input}
                value={eventForm.location}
                onChangeText={(text) => setEventForm({...eventForm, location: text})}
                placeholder="Enter event location"
              />
              
              <Text style={styles.inputLabel}>Category</Text>
              <TextInput
                style={styles.input}
                value={eventForm.category}
                onChangeText={(text) => setEventForm({...eventForm, category: text})}
                placeholder="E.g., Academic, Social, Workshop"
              />
              
              <Text style={styles.inputLabel}>Event Image</Text>
              <TouchableOpacity 
                style={styles.imagePickerButton}
                onPress={pickImage}
              >
                <Text style={styles.imagePickerText}>
                  {eventForm.imageUrl ? 'Change Image' : 'Select Image'}
                </Text>
              </TouchableOpacity>
              
              {eventForm.imageUrl && (
                <Text style={styles.imageSelected}>Image selected</Text>
              )}
            </ScrollView>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEvent}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Event</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Roboto-bold',
    marginBottom: 5,
    color: Colors.PRIMARY,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto-reg',
    marginBottom: 20,
    color: Colors.GRAY,
  },
  addButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontFamily: 'Roboto-bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-bold',
    marginTop: 10,
    marginBottom: 15,
  },
  eventsContainer: {
    flex: 1,
  },
  eventCard: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: 'Roboto-bold',
    marginBottom: 5,
    color: Colors.PRIMARY,
  },
  eventDate: {
    fontSize: 14,
    fontFamily: 'Roboto-med',
    marginBottom: 3,
  },
  eventLocation: {
    fontSize: 14,
    fontFamily: 'Roboto-reg',
    marginBottom: 3,
  },
  eventCategory: {
    fontSize: 14,
    fontFamily: 'Roboto-reg',
    marginBottom: 3,
    color: Colors.GRAY,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: Colors.PRIMARY,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: 'white',
    fontFamily: 'Roboto-med',
    fontSize: 14,
  },
  emptyState: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    textAlign: 'center',
    color: Colors.GRAY,
    fontFamily: 'Roboto-med',
  },
  loader: {
    marginTop: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Roboto-bold',
    marginBottom: 15,
    color: Colors.PRIMARY,
    textAlign: 'center',
  },
  formContainer: {
    maxHeight: '80%',
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Roboto-med',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Roboto-reg',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 5,
  },
  imagePickerText: {
    fontFamily: 'Roboto-med',
    color: Colors.PRIMARY,
  },
  imageSelected: {
    marginTop: 8,
    fontFamily: 'Roboto-reg',
    color: 'green',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontFamily: 'Roboto-med',
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    marginLeft: 10,
  },
  saveButtonText: {
    color: 'white',
    fontFamily: 'Roboto-med',
  }
});

export default ManageEvents;