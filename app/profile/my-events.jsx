import { 
    View, Text, FlatList, TouchableOpacity, ActivityIndicator, 
    StyleSheet, RefreshControl, Alert 
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";

export default function MyRegisteredEvents() {
    const { user } = useUser();
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            console.error("❌ Error fetching registered events:", error);
            Alert.alert("Error", "Could not load your events. Please try again later.");
        } finally {
            setLoading(false);
            setRefreshing(false); // Stop refreshing animation
        }
    };

    // ✅ Pull-to-refresh function
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchRegisteredEvents();
    }, []);

    // ✅ Prevents withdrawal if Accepted or Rejected
    const withdrawApplication = async (eventId, status) => {
        if (status === "Accepted" || status === "Rejected") {
            Alert.alert(
                "Cannot Withdraw",
                `You cannot withdraw from a ${status.toLowerCase()} event.`,
                [{ text: "OK" }]
            );
            return;
        }

        try {
            await deleteDoc(doc(db, "Applications", eventId));
            Alert.alert("Success", "Application withdrawn successfully.");
            fetchRegisteredEvents(); // Refresh list
        } catch (error) {
            console.error("❌ Error withdrawing application:", error);
            Alert.alert("Error", "Failed to withdraw application. Please try again.");
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Pending": return "#F59E0B"; // Amber
            case "Accepted": return "#10B981"; // Green
            case "Rejected": return "#EF4444"; // Red
            default: return "#6B7280"; // Gray
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending": return "hourglass-outline";
            case "Accepted": return "checkmark-circle";
            case "Rejected": return "close-circle";
            default: return "help-circle";
        }
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyText}>You haven't registered for any events yet</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Registered Events</Text>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loadingText}>Loading your events...</Text>
                </View>
            ) : (
                <FlatList
                    data={registeredEvents}
                    keyExtractor={(item) => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0891B2"]} />
                    }
                    ListEmptyComponent={renderEmptyList}
                    renderItem={({ item }) => (
                        <View style={styles.eventCard}>
                            <View style={styles.eventHeader}>
                                <Text style={styles.eventName}>{item.eventName}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
                                    <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                            
                            <View style={styles.actionsContainer}>
                                <TouchableOpacity 
                                    style={[
                                        styles.actionButton,
                                        (item.status === "Accepted" || item.status === "Rejected") 
                                            ? styles.actionButtonDisabled 
                                            : styles.actionButtonDelete
                                    ]}
                                    onPress={() => withdrawApplication(item.id, item.status)}
                                    disabled={item.status === "Accepted" || item.status === "Rejected"}
                                >
                                    <Text style={(item.status === "Accepted" || item.status === "Rejected") ? styles.actionTextDisabled : styles.actionTextDelete}>
                                        {item.status === "Accepted" ? "Attendance Confirmed" 
                                         : item.status === "Rejected" ? "Application Rejected" 
                                         : "Withdraw Application"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#F8FAFC" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#0F172A",marginTop:20 },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 16, color: "#64748B" },
    eventCard: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
    eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    eventName: { fontSize: 18, fontWeight: "600", color: "#1E293B" },
    statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 14, fontWeight: "500", marginLeft: 4 },
    actionsContainer: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
    actionButtonDelete: { backgroundColor: "#FEE2E2" },
    actionButtonDisabled: { backgroundColor: "#F1F5F9" },
    actionTextDelete: { color: "#EF4444", fontWeight: "500" },
    actionTextDisabled: { color: "#94A3B8", fontWeight: "500" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 50 },
    emptyText: { fontSize: 16, color: "#94A3B8", marginTop: 16, textAlign: "center" },
});
