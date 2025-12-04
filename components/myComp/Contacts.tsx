import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Pressable } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useContactsStore } from '@/store/contactsStore';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';

type Participant = {
    _id: string;
    name: string;
    publicKey: string;
};

type Contact = {
    _id: string;
    participants: Participant[];
};


const Contacts = () => {
    const router = useRouter();
    const contacts = useContactsStore(s => s.contacts);
    const loginUserName = useUserStore(s => s.user.name);
    const setRoom = useRoomStore(s => s.setRoom);


    const renderContact = ({ item }: { item: Contact }) => {
        const participant = item.participants;

        const handelClickContact = async () => {         
            setRoom({ reciverId: participant[0]._id, roomId: item._id, reciverName: item.participants[0].name, publicKey: item.participants[0].publicKey })
            router.push(`/(chat)/${participant[0]._id}`);
        }

        return (
            <TouchableOpacity style={styles.contactItem} onPress={handelClickContact}>
                <Image
                    source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${participant[0].name}` }}
                    style={styles.avatar}
                />
                <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{participant[0].name}</Text>
                    <Text style={styles.contactId}>ID: {participant[0]._id}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.searchBar}
                    onPress={() => router.push('/search')}
                >
                    <Ionicons name="search" size={20} color="#999" />
                    <Text style={styles.searchPlaceholder}>Search contacts...</Text>
                </Pressable>

                <Pressable style={styles.profileButton} onPress={()=>router.push('/logout')}>
                    <Image
                        source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${loginUserName}` }}
                        style={styles.profileAvatar}
                    />
                </Pressable>
            </View>

            {/* Contacts List */}
            <FlatList
                data={contacts}
                renderItem={renderContact}
                keyExtractor={(item) => item._id.toString()}
                contentContainerStyle={styles.listContent}
            />
        </View>
    )
}

export default Contacts

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        gap: 10
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        gap: 10
    },
    searchPlaceholder: {
        color: '#999',
        fontSize: 16
    },
    profileButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden'
    },
    profileAvatar: {
        width: '100%',
        height: '100%'
    },
    listContent: {
        paddingVertical: 10
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15
    },
    contactInfo: {
        flex: 1
    },
    contactName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    contactId: {
        fontSize: 14,
        color: '#666'
    }
})
