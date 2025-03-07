import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function MyRegisteredEvents() {
    const { user } = useUser();
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // "all", "pending", "accepted"

    useEffect(() => {
        if (user) fetchRegisteredEvents();
    }, [user]);

    const fetchRegisteredEvents = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "Applications"));
            const events = querySnapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(event => event.userEmail === user.primaryEmailAddress.emailAddress);

            setRegisteredEvents(events);
        } catch (error) {
            console.error("Error fetching registered events:", error);
        } finally {
            setLoading(false);
        }
    };

    const withdrawApplication = async (eventId, status, eventName) => {
        if (status === "Accepted") {
            Alert.alert(
                "Cannot Withdraw",
                "You cannot withdraw from an accepted event. Please contact the organizer.",
                [{ text: "OK" }]
            );
            return;
        }

        Alert.alert(
            "Withdraw Application",
            `Are you sure you want to withdraw your application for "${eventName}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Withdraw", 
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDoc(doc(db, "Applications", eventId));
                            Alert.alert("Success", "Application withdrawn successfully.");
                            fetchRegisteredEvents();
                        } catch (error) {
                            console.error("Error withdrawing application:", error);
                            Alert.alert("Error", "Failed to withdraw application. Please try again.");
                        }
                    }
                }
            ]
        );
    };

    const filteredEvents = filter === "all" 
        ? registeredEvents 
        : registeredEvents.filter(event => event.status.toLowerCase() === filter);

    const getStatusIcon = (status) => {
        switch(status) {
            case "Accepted":
                return { name: "checkmark-circle", color: "#059669" };
            case "Pending":
                return { name: "time", color: "#D97706" };
            case "Rejected":
                return { name: "close-circle", color: "#EF4444" };
            default:
                return { name: "help-circle", color: "#6B7280" };
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Applications</Text>
                <Text style={styles.subtitle}>Track your event applications</Text>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity 
                    style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
                    onPress={() => setFilter("all")}>
                    <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, filter === "pending" && styles.filterButtonActive]}
                    onPress={() => setFilter("pending")}>
                    <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterButton, filter === "accepted" && styles.filterButtonActive]}
                    onPress={() => setFilter("accepted")}>
                    <Text style={[styles.filterText, filter === "accepted" && styles.filterTextActive]}>Accepted</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                    <Text style={styles.loadingText}>Loading your applications...</Text>
                </View>
            ) : filteredEvents.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No applications found</Text>
                    <Text style={styles.emptySubtext}>
                        {filter !== "all" 
                            ? `You don't have any ${filter} applications`
                            : "You haven't applied to any events yet"}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredEvents}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => {
                        const statusIcon = getStatusIcon(item.status);
                        
                        return (
                            <View style={styles.card}>
                                <View style={styles.eventHeader}>
                                    <View style={styles.eventIconContainer}>
                                        <Ionicons name="calendar" size={20} color="#4F46E5" />
                                    </View>
                                    <View style={styles.eventDetails}>
                                        <Text style={styles.eventName}>{item.eventName}</Text>
                                        <View style={styles.statusContainer}>
                                            <Ionicons name={statusIcon.name} size={16} color={statusIcon.color} />
                                            <Text style={[styles.statusText, { color: statusIcon.color }]}>
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <View style={styles.cardFooter}>
                                    <Text style={styles.dateText}>Applied on {new Date().toLocaleDateString()}</Text>
                                    
                                    {item.status === "Accepted" ? (
                                        <View style={styles.confirmedBadge}>
                                            <Ionicons name="checkmark" size={16} color="#059669" />
                                            <Text style={styles.confirmedText}>Confirmed</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity 
                                            style={styles.withdrawButton}
                                            onPress={() => withdrawApplication(item.id, item.status, item.eventName)}>
                                            <Ionicons name="close" size={16} color="#EF4444" />
                                            <Text style={styles.withdrawText}>Withdraw</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9FAFB",
        padding: 16,
    },
    header: {
        marginBottom: 24,
        marginTop:20
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#111827",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 4,
    },
    filterContainer: {
        flexDirection: "row",
        marginBottom: 16,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: "#F3F4F6",
    },
    filterButtonActive: {
        backgroundColor: "#4F46E5",
    },
    filterText: {
        fontSize: 14,
        color: "#6B7280",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: "#6B7280",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#374151",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
        textAlign: "center",
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    eventHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    eventIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EEF2FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    eventDetails: {
        flex: 1,
    },
    eventName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
    },
    statusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    statusText: {
        fontSize: 14,
        marginLeft: 4,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingTop: 12,
        marginTop: 4,
    },
    dateText: {
        fontSize: 12,
        color: "#6B7280",
    },
    confirmedBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#DCFCE7",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    confirmedText: {
        color: "#059669",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 4,
    },
    withdrawButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    withdrawText: {
        color: "#EF4444",
        fontSize: 12,
        fontWeight: "500",
        marginLeft: 4,
    },
});