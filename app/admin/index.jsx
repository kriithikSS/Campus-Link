import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // Replace hardcoded stats with dynamic data from analytics
  const [stats, setStats] = useState({
    posts: 0,
    myPosts: 0,
    topViewedPost: null,
    averageViews: 0
  });
  
  // Fetch analytics data on component mount
  useEffect(() => {
    if (user) {
      fetchAnalyticsData(user.primaryEmailAddress.emailAddress);
      
      // Set up interval for periodic updates (every 30 seconds)
      const interval = setInterval(() => {
        fetchAnalyticsData(user.primaryEmailAddress.emailAddress);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const fetchAnalyticsData = async (adminEmail) => {
    setLoading(true);
    try {
      // Fetch all posts
      const allPostsSnapshot = await getDocs(collection(db, 'Works'));
      const allPosts = allPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch admin's posts
      const myPostsQuery = query(collection(db, 'Works'), where('adminEmail', '==', adminEmail));
      const myPostsSnapshot = await getDocs(myPostsQuery);
      const myPosts = myPostsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Fetch pending applications (you might need to adjust this based on your schema)
      const pendingQuery = query(collection(db, 'Applications'), where('status', '==', 'pending'));
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingApplications = pendingSnapshot.docs.length;
      
      // Calculate basic analytics
      const totalPosts = allPosts.length;
      const myTotalPosts = myPosts.length;
      const mostViewedPost = allPosts.reduce((max, post) => (post.views > (max?.views || 0) ? post : max), null);
      const totalViews = allPosts.reduce((sum, post) => sum + (post.views || 0), 0);
      const averageViews = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
      
      setStats({
        posts: totalPosts,
        myPosts: myTotalPosts,
        topViewedPost: mostViewedPost,
        averageViews: averageViews,
        applicants: pendingApplications + Math.round(totalViews * 0.03), // Using a calculation similar to analytics.jsx
        pending: pendingApplications
      });
      
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const menuItems = [
    {
      title: 'Add Post',
      description: 'Add a new post for an event or club',
      icon: 'add-circle',
      route: '/admin/manage-events',
      color: '#4F46E5'
    },
    {
      title: 'Manage Posts',
      description: 'Edit or delete campus posts',
      icon: 'document-text',
      route: '/admin/user-management',
      color: '#0891B2'
    },
    {
      title: 'Manage Applicants',
      description: 'View and approve student applications',
      icon: 'people',
      route: '/admin/manage-applicants',
      color: '#059669'
    },
    {
      title: 'Analytics',
      description: 'View event participation and app usage',
      icon: 'bar-chart',
      route: '/admin/analytics',
      color: '#9333EA'
    },
    {
      title: 'Return to Main App',
      description: 'Switch to regular user view',
      icon: 'arrow-back',
      route: '/(tabs)/home',
      color: '#6B7280'
    }
  ];
  
  const handleRefresh = () => {
    if (user) {
      fetchAnalyticsData(user.primaryEmailAddress.emailAddress);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>
                Welcome back,
              </Text>
              <Text style={styles.name}>
                {user?.firstName || 'Admin'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color={Colors.PRIMARY} />
            </TouchableOpacity>
            
            <View style={styles.avatarContainer}>
              {user?.profileImageUrl ? (
                <Image 
                  source={{ uri: user.profileImageUrl }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(user?.firstName?.[0] || 'A')}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.PRIMARY} />
              <Text style={styles.loadingText}>Loading dashboard data...</Text>
            </View>
          ) : (
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={[styles.statItem, styles.statItemBorder]}>
                <Text style={styles.statNumber}>{stats.applicants || 0}</Text>
                <Text style={styles.statLabel}>Applicants</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.pending || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          )}
          
          {!loading && stats.topViewedPost && (
            <View style={styles.topPostContainer}>
              <Text style={styles.topPostTitle}>🔥 Top Performing Post</Text>
              <View style={styles.topPostContent}>
                <Text style={styles.topPostName} numberOfLines={1}>
                  {stats.topViewedPost.name}
                </Text>
                <View style={styles.topPostStats}>
                  <Ionicons name="eye-outline" size={16} color={Colors.TEXT_SECONDARY} />
                  <Text style={styles.topPostStatText}>{stats.topViewedPost.views || 0} views</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>Admin Tools</Text>
        
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index}
              style={styles.menuCard} 
              onPress={() => router.push(item.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Text style={styles.menuItemDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.quickActionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/admin/manage-applicants')}
          >
            <View style={styles.quickActionContent}>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>
                Review {stats.pending || 0} Pending Applications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#0891B2' }]}
            onPress={() => router.push('/admin/manage-events')}
          >
            <View style={styles.quickActionContent}>
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Create New Post</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          {!loading && (
            <TouchableOpacity 
              style={[styles.quickActionButton, { backgroundColor: '#9333EA' }]}
              onPress={() => router.push('/admin/analytics')}
            >
              <View style={styles.quickActionContent}>
                <Ionicons name="bar-chart" size={22} color="#FFFFFF" />
                <Text style={styles.quickActionText}>
                  View Analytics ({stats.averageViews} avg. views)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  loadingText: {
    marginTop: 8,
    color: Colors.TEXT_SECONDARY,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  topPostContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  topPostTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.TEXT_SECONDARY,
    marginBottom: 8,
  },
  topPostContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topPostName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY,
    flex: 1,
  },
  topPostStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topPostStatText: {
    marginLeft: 4,
    color: Colors.TEXT_SECONDARY,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  menuItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  quickActionContainer: {
    marginBottom: 20,
  },
  quickActionButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 12,
  },
});

export default AdminDashboard;