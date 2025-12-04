import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import Messages from '@/components/myComp/Messages';
import { getMessages } from '@/Api/api';
import { Alert, Text, View, ActivityIndicator, StatusBar } from 'react-native';
import Header from '@/components/myComp/Header';

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

type apiRes = {
    message: string;
    allMessages: message[];
}

const ChatScreen = () => {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<message[]>([]);

    async function initialCall() {
        setLoading(true);
        try {
            const apiResponse: apiRes = await getMessages(id!.toString());
            setMessages(apiResponse.allMessages);
        } catch (error: any) {
            Alert.alert("Error", error?.message || "Internal server error.");
        }
        setLoading(false);
    }

    useEffect(() => {
        initialCall();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle={"dark-content"} />
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                    <Text>Loading messages...</Text>
                </View>
            ) : (
                <>
                    <Header />
                    <Messages chatMessages={messages} />
                </>
            )}
        </View>
    );
};

export default ChatScreen;
