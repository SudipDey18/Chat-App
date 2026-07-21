import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import Messages from "@/components/myComp/Messages";
import { getMessages, getPublicKey } from "@/Api/api";
import { Alert, Text, View, ActivityIndicator, StatusBar } from "react-native";
import Header from "@/components/myComp/Header";
import { useRoomStore } from "@/store/roomStore";

type sender = {
  _id: string;
  name: string;
};

type message = {
  _id: string;
  sender: sender;
  reciver: string;
  senderMsg: string;
  reciverMsg: string;
  createdAt: string;
};

type apiRes = {
  message: string;
  allMessages: message[];
};

const ChatScreen = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<message[]>([]);
  const roomData = useRoomStore((s) => s.room);
  const setPublicKey = useRoomStore((s) => s.setPublicKey);

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

  async function setReceiverKey() {
    if (!roomData.publicKey && id) {
      const apiRes = await getPublicKey(String(id));
      setPublicKey(apiRes.publicKey);
    }
  }

  useEffect(() => {
    initialCall();
    setReceiverKey();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={"dark-content"} />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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
