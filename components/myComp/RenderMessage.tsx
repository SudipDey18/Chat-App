import { useUserStore } from "@/store/userStore";
import { memo, useEffect, useState } from "react";
import { Image } from "react-native";
import { StyleSheet } from "react-native";
import { Text } from "react-native";
import { View } from "react-native";
import { RSA } from 'react-native-rsa-native';

type sender = {
    "_id": string;
    "name": string;
}

type message = {
    _id: string;
    sender: sender;
    reciver: string;
    senderMsg: string;
    reciverMsg: string;
    createdAt: string;
}

export const RenderMessage = memo(function ({ item }: { item: message }) {
    const [decrypted, setDecrypted] = useState("");
    const loginUser = useUserStore(s => s.user);

    
    const isCurrentUser = loginUser.id === item.sender._id;

    useEffect(() => {
        async function decryptMsg() {
            const text = await RSA.decrypt(
                isCurrentUser ? item.senderMsg : item.reciverMsg,
                loginUser.privateKey
            );

            setDecrypted(text);
        }
        decryptMsg();
    }, []);

    return (
        <View style={[
            styles.messageContainer,
            isCurrentUser ? styles.rightMessage : styles.leftMessage
        ]} >
            {!isCurrentUser && (
                <Image
                    source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.sender.name}` }}
                    style={styles.avatar}
                />
            )}

            <View style={[
                styles.messageBubble,
                isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
            ]}>
                <Text style={[
                    styles.messageText,
                    isCurrentUser ? styles.currentUserText : styles.otherUserText
                ]}>
                    {decrypted}
                </Text>
                <Text style={styles.timestamp}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>

            {isCurrentUser && (
                <Image
                    source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${item.sender.name}` }}
                    style={styles.avatar}
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        marginHorizontal: 10,
        alignItems: 'flex-end'
    },
    leftMessage: {
        justifyContent: 'flex-start'
    },
    rightMessage: {
        justifyContent: 'flex-end'
    },
    currentUserBubble: {
        backgroundColor: '#AEFCD7',
        borderBottomRightRadius: 5
    },
    otherUserBubble: {
        backgroundColor: '#E5E5EA',
        borderBottomLeftRadius: 5
    },
    messageText: {
        fontSize: 16
    },
    currentUserText: {
        color: '#000'
    },
    otherUserText: {
        color: '#000'
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        color: "#383838ff",
        opacity: 0.7
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 8
    },
    messageBubble: {
        maxWidth: '60%',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20
    },
})