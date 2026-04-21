import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import React, { useState } from "react";
import * as Clipboard from "expo-clipboard";
import { createPrivateRoom } from "@/Api/api";
import Toast from "react-native-toast-message";

const CreatePrivateRoom = () => {
    const [roomName, setRoomName] = useState("");
    const [roomId, setRoomId] = useState<string | null>(null);

    const createRoom = async () => {
        if (!roomName.trim()) {
            Alert.alert("Error", "Room name is required");
            return;
        }
        try {
            const apiRes = await createPrivateRoom(roomName);
            setRoomId(apiRes?.id);
            Toast.show({
                type: 'success',
                text1: apiRes.message,
            });
        } catch (error: any) {
            Toast.show({
                type: 'info',
                text1: error.message,
            });
        }
    };

    const copyRoomId = async () => {
        if (!roomId) return;
        await Clipboard.setStringAsync(roomId);
        Toast.show({
            type: 'success',
            text1: "Room ID copied to clipboard",
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Private Chat</Text>

            <TextInput
                placeholder="Enter room name"
                value={roomName}
                onChangeText={setRoomName}
                style={styles.input}
            />

            <TouchableOpacity style={styles.primaryBtn} onPress={createRoom}>
                <Text style={styles.btnText}>Create Room</Text>
            </TouchableOpacity>

            {roomId && (
                <View style={styles.roomBox}>
                    <Text style={styles.label}>Room Created 🎉</Text>
                    <Text style={styles.roomId}>{roomId}</Text>

                    <TouchableOpacity style={styles.copyBtn} onPress={copyRoomId}>
                        <Text style={styles.copyText}>Copy Room ID</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default CreatePrivateRoom;

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
        marginBottom: 20,
        color: "#0F172A",
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E5E7EB",
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
    },
    primaryBtn: {
        backgroundColor: "#4F46E5",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    btnText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 16,
    },
    roomBox: {
        marginTop: 30,
        padding: 16,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    label: {
        fontSize: 14,
        color: "#64748B",
    },
    roomId: {
        fontSize: 18,
        fontWeight: "700",
        marginVertical: 8,
        color: "#0F172A",
    },
    copyBtn: {
        backgroundColor: "#EEF2FF",
        padding: 10,
        borderRadius: 10,
        alignItems: "center",
    },
    copyText: {
        color: "#4338CA",
        fontWeight: "600",
    },
});
