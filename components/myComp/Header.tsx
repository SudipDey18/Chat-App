import { Image, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { useRoomStore } from '@/store/roomStore';
import { Ionicons } from '@expo/vector-icons';

const Header = () => {
    const router = useRouter();
    const userName = useRoomStore(s => s.room.reciverName);

    return (
        <View style={styles.headerContainer}>
            {/* Left: Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            {/* Center: Name */}
            <Text style={styles.headerTitle}>
                {userName || "Chat"}
            </Text>

            {/* Right: Avatar Image */}
            <Image
                source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${userName}` }}
                style={styles.headerImage}
            />
        </View>
    );
}

export default Header

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 60,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#000',
        flex: 1,
        paddingLeft: 10
    },
    headerImage: {
        width: 40,
        height: 40,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#ddd'
    }
});