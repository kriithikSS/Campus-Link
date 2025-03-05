import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';

export default function HelpSupport() {
    const navigation = useNavigation();
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const faqs = [
        {
            id: 1,
            question: "How do I join a club?",
            answer: "To join a club, browse through the clubs listed in the app and click on the 'Join' button on the club's page. You can explore clubs by category or search for specific interests."
        },
        {
            id: 2,
            question: "How can I become an admin for my club?",
            answer: "If you are a club leader wanting to manage your club's posts, email our support team at support@campuslink.com with your club details. We'll help you set up admin access quickly."
        },
        {
            id: 3,
            question: "How do I post an event?",
            answer: "Club admins can easily create events by navigating to the 'Manage Events' section and using the 'Add Event' button. Fill in event details, upload a cover image, and set event parameters."
        },
        {
            id: 4,
            question: "Who can I contact for technical issues?",
            answer: "For any technical assistance or account-related queries, please reach out to our dedicated support team at support@campuslink.com. We aim to respond within 24 hours."
        }
    ];

    const toggleFAQ = (id) => {
        setExpandedFAQ(expandedFAQ === id ? null : id);
    };

    return (
        <ScrollView 
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.headerContainer}>
                <Text style={styles.headerIcon}>❓</Text>
                <Text style={styles.title}>Help & Support</Text>
            </View>
            
            <Text style={styles.description}>
                Welcome to CampusLink! We're here to help you navigate and make the most of our platform.
            </Text>

            <View style={styles.faqSection}>
                <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
                {faqs.map((faq) => (
                    <TouchableOpacity 
                        key={faq.id} 
                        style={[
                            styles.faqItem, 
                            { 
                                backgroundColor: expandedFAQ === faq.id 
                                    ? Colors.LIGHTBLUE || '#E6F2FF' 
                                    : Colors.WHITE
                            }
                        ]} 
                        onPress={() => toggleFAQ(faq.id)}
                    >
                        <View style={styles.faqHeader}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Text style={styles.expandIcon}>
                                {expandedFAQ === faq.id ? '▲' : '▼'}
                            </Text>
                        </View>
                        {expandedFAQ === faq.id && (
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity 
                style={styles.contactSection}
                onPress={() => {
                    // Implement email intent or navigation
                }}
            >
                <Text style={styles.contactTitle}>Contact Support</Text>
                <Text style={styles.contactText}>
                    Need personalized help? Reach out to our support team.
                </Text>
                <Text style={styles.email}>support@campuslink.com</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND || '#F5F5F5',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 10,
    },
    headerIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.PRIMARY || '#007BFF',
    },
    description: {
        fontSize: 16,
        color: Colors.GRAY || '#666',
        paddingHorizontal: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    faqSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    faqTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: Colors.PRIMARY || '#007BFF',
    },
    faqItem: {
        padding: 15,
        backgroundColor: Colors.WHITE || 'white',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.LIGHTGRAY || '#E0E0E0',
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
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQuestion: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.DARK || '#333',
        flex: 1,
        marginRight: 10,
    },
    expandIcon: {
        color: Colors.GRAY || '#888',
    },
    faqAnswer: {
        fontSize: 14,
        color: Colors.GRAY || '#666',
        marginTop: 10,
        lineHeight: 20,
    },
    contactSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        backgroundColor: Colors.PRIMARY || '#007BFF',
        borderRadius: 12,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    contactText: {
        fontSize: 16,
        color: 'white',
        marginBottom: 5,
        opacity: 0.8,
    },
    email: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
});