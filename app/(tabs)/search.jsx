import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function SearchScreen() {
    const router = useRouter();  // ✅ Using router for navigation
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
                data={filteredPosts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.postContainer}
                        onPress={() => router.push(`/SRM-details?name=${encodeURIComponent(item.name)}&imageUrl=${encodeURIComponent(item.imageUrl)}&category=${encodeURIComponent(item.category)}`)}
                    >
                        <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
                        <Text style={styles.postTitle}>{item.name}</Text>
                    </TouchableOpacity>
                )}
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
    },
    postContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 10,
        elevation: 2,
    },
    postImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 10,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
