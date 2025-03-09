import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import SRMListItem from '../../components/Home/SRMListItem';

export default function SearchScreen() {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const snapshot = await getDocs(collection(db, 'Works'));
        const fetchedPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (text === '') {
            setFilteredPosts(posts);
        } else {
            const filtered = posts.filter(post => post.name.toLowerCase().includes(text.toLowerCase()));
            setFilteredPosts(filtered);
        }
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#999" style={styles.icon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name..."
                    value={searchText}
                    onChangeText={handleSearch}
                />
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={20} color="gray" style={styles.clearIcon} />
                    </TouchableOpacity>
                )}
            </View>

            <FlatList
                key="grid-view"  // Add a key prop to force re-render when numColumns changes
                data={filteredPosts}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, margin: 10 }}>
                        <SRMListItem SRM={item} />
                    </View>
                )}
                contentContainerStyle={{ paddingHorizontal: 10 }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        paddingTop: 25,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 10,
        margin: 10,
        elevation: 3,
    },
    icon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    clearIcon: {
        marginLeft: 8,
    }
});