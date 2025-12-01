import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore'; // Import your stores to clear them

const LogoutScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const clearUser = useUserStore(s => s.clearUser);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await AsyncStorage.clear();
            clearUser();
            router.replace('/Login');
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to log out. Please try again.");
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.contentContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="log-out" size={60} color="#FF3B30" />
                </View>

                <Text style={styles.title}>Log Out</Text>
                <Text style={styles.subtitle}>Are you sure you want to leave?</Text>

                <View style={styles.buttonContainer}>

                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.logoutButtonText}>Yes, Log Out</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => router.back()}
                        disabled={loading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel / Go Back</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    contentContainer: {
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#FFEBEE',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: '100%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    cancelButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default LogoutScreen;