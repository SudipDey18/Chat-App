import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as Clipboard from "expo-clipboard";
import { deletePrivateRoom, getCreatedRooms } from "@/Api/api";
import { socket } from "@/socket/socket";
import Toast from "react-native-toast-message";
import { useUserStore } from "@/store/userStore";
import { usePrivateRoomStore } from "@/store/privateRoomStore";
import { router } from "expo-router";

type Room = {
    _id: string;
    name: string;
};

const JoinPrivateRoom = () => {
    const [roomId, setRoomId] = useState("");
    const [rooms, setRooms] = useState<Room[]>([]);

    const loginUserName = useUserStore(s => s.user.name);
    const setPrivateRoom = usePrivateRoomStore(s => s.setRoomId);

    const fetchRooms = async () => {
        let apiRes = await getCreatedRooms();
        // console.log(apiRes);
        setRooms(apiRes.rooms)
    }

    useEffect(() => {
        fetchRooms();

        socket.on('joinError', (data) => {
            Toast.show({
                type: 'error',
                text1: data.message,
            });
        });

        socket.on('joinSuccess', (data) => {
            setPrivateRoom(data.roomId);
            router.push('/privateChatScreen');
        });

        return () => {
            socket.off("joinError");
            socket.off("joinSuccess");
        }
    }, []);

    const joinRoom = async () => {
        if (!roomId.trim()) {
            Toast.show({
                type: 'error',
                text1: "Enter valid room ID",
            });
            return;
        }

        socket.emit("joinPrivateChat", { roomId, user: loginUserName });
    };

    const deleteRoom = async (id: string) => {
        try {
            const deleteRes = await deletePrivateRoom(id);
            console.log(deleteRes);
            if (deleteRes.success) {
                Toast.show({
                    type: 'success',
                    text1: deleteRes.message,
                });
                setRooms(prev => prev.filter(r => r._id !== id));
            }
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: error.message,
            });
        }
    };

    const copyRoomId = async (id: string) => {
        await Clipboard.setStringAsync(id);
        Toast.show({
            type: 'success',
            text1: "Room ID copied to clipboard",
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join Private Chat</Text>
            <Text style={{ fontSize: 11, color: "#b50000ff", marginBottom: 15 }}>If you exit from chat screen, all private room chats delete from your phone.</Text>
            {/* ===== Join Input ===== */}
            <TextInput
                placeholder="Enter Room ID"
                value={roomId}
                onChangeText={setRoomId}
                style={styles.input}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={joinRoom}>
                <Text style={styles.btnText}>Join Room</Text>
            </TouchableOpacity>

            {/* ===== Created Rooms ===== */}
            <Text style={styles.subTitle}>Your Created Rooms</Text>

            <FlatList
                data={rooms}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <Pressable
                        style={styles.roomCard}
                        onLongPress={() => copyRoomId(item._id)}
                    >
                        <View style={styles.textContainer}>
                            <Text
                                style={styles.roomName}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {item.name}
                            </Text>

                            <Text
                                style={styles.roomId}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                            >
                                {item._id}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => deleteRoom(item._id)}
                        >
                            <Text style={styles.deleteText}>Delete</Text>
                        </TouchableOpacity>
                    </Pressable>

                )}
            />
        </View>
    );
};

export default JoinPrivateRoom;

/* ===== Styles ===== */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: "#F8FAFC",
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 16,
        color: "#0F172A",
    },
    subTitle: {
        marginTop: 28,
        marginBottom: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#334155",
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
    },
    primaryBtn: {
        backgroundColor: "#2ba618ff",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    roomCard: {
        backgroundColor: "#FFFFFF",
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    roomName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0F172A",
        flexShrink: 1,
    },
    roomId: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 4,
        flexShrink: 1,
    },
    deleteBtn: {
        backgroundColor: "#FEE2E2",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexShrink: 0,
    },
    deleteText: {
        color: "#DC2626",
        fontWeight: "600",
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
});
