import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useContactsStore } from '@/store/contactsStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRoomStore } from '@/store/roomStore';
import { searchContact } from '@/Api/api';
import { useUserStore } from '@/store/userStore';

type Participant = {
    _id: string;
    name: string;
};

type Contact = {
    _id: string;
    participants: Participant[];
};

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(false);
    const contacts = useContactsStore(s => s.contacts);
    const setRoom = useRoomStore(s => s.setRoom);
    const userId = useUserStore(s => s.user.id);

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, contacts]);

    const handleSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        if (query.startsWith('@')) {
            await searchDatabase(query.substring(1));
        } else {
            searchLocalContacts(query);
        }
    };

    const searchLocalContacts = (query: string) => {
        const lowerQuery = query.toLowerCase();
        const results: Participant[] = [];

        contacts.forEach((contact: Contact) => {
            if (contact.participants[0].name.toLowerCase().includes(lowerQuery)) {
                results.push(contact.participants[0]);
            }
        });

        setSearchResults(results);
    };

    const searchDatabase = async (query: string) => {
        if (!query) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        try {
            const apiRes = await searchContact(encodeURIComponent(query));

            setSearchResults(apiRes.users);
        } catch (error) {
            console.error('Database search failed:', error);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = async (user: Participant) => {
        setRoom({ reciverId: user._id, roomId: "", reciverName: user.name })
        router.push(`/(chat)/${user._id}`);

    };

    const renderUserItem = ({ item }: { item: Participant }) => {
        if (item._id === userId) return null;

        return (
            <TouchableOpacity
                style={styles.userItem}
                onPress={() => handleSelectUser(item)}
            >
                <Image
                    source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.name}` }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userId}>ID: {item._id}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    const renderEmptyState = () => {
        if (!searchQuery.trim()) {
            return (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Search for contacts</Text>
                    <Text style={styles.emptySubtext}>
                        Use @ to search database{'\n'}
                        Or type name for local search
                    </Text>
                </View>
            );
        }

        if (loading) {
            return null;
        }

        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found</Text>
                <Text style={styles.emptySubtext}>
                    {searchQuery.startsWith('@')
                        ? 'Try a different username'
                        : 'No matching contacts'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search contacts or @username"
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoFocus
                    autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Text style={styles.clearButtonText}>✕</Text>
                    </TouchableOpacity>
                )}
            </View>

            {searchQuery.startsWith('@') && (
                <View style={styles.searchTypeIndicator}>
                    <Text style={styles.searchTypeText}>
                        🔍 Searching database...
                    </Text>
                </View>
            )}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={styles.loadingText}>Searching...</Text>
                </View>
            ) : (
                <FlatList
                    data={searchResults}
                    renderItem={renderUserItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        color: "black",
    },
    clearButton: {
        marginLeft: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#ddd',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButtonText: {
        fontSize: 18,
        color: '#666',
    },
    searchTypeIndicator: {
        backgroundColor: '#E3F2FD',
        padding: 8,
        alignItems: 'center',
    },
    searchTypeText: {
        fontSize: 12,
        color: '#1976D2',
    },
    listContent: {
        paddingVertical: 10,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    userInfo: {
        marginLeft: 15,
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    userId: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
});
