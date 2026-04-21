import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  ImageBackground,
  Animated,
  BackHandler,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { PrivateMessage } from "./PrivateMessage";
import { socket } from "@/socket/socket";
import { usePrivateRoomStore } from "@/store/privateRoomStore";
import { useUserStore } from "@/store/userStore";
import Toast from "react-native-toast-message";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { router } from "expo-router";

export type Message = {
  sender: string;
  message: string;
  timestamp: string;
  own: boolean;
};

export default function PrivateChat() {
  const [messageText, setMessageText] = useState("");
  const keyboardOffset = useRef(new Animated.Value(0)).current;
  const privateRoom = usePrivateRoomStore(s => s.roomId);
  const loginUserName = useUserStore(s => s.user.name);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket.on("privateMessage", (data) => {
      setMessages(prev => [data, ...prev]);
    });

    socket.on("successMessage", (data) => {
      if (data.success && privateRoom == data.roomId) {
        const newMsg: Message = {
          message: messageText,
          own: true,
          sender: loginUserName,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [newMsg, ...prev]);
        setMessageText("");
      }
    });

    socket.on("newJoin", (data) => {
      Toast.show({
        type: 'success',
        text1: `${data.joinUser} join this room`,
      });
    });

    socket.on("userLeft", (data) => {
      Toast.show({
        type: 'info',
        text1: `${data.leftUser} Left this room`,
      });
    });

    const backAction = () => {
      socket.emit("leftPrivateChat", { roomId: privateRoom, user: loginUserName, left: true });
      router.back();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => {
      socket.off("privateMessage");
      socket.off("successMessage");
      socket.off("newJoin");
      socket.off("userLeft");
      backHandler.remove();
      // socket.emit("leftPrivateChat", { roomId: privateRoom, user: loginUserName, left: true });
    }
  })

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    socket.emit("privateChat", { roomId: privateRoom, message: messageText, user: loginUserName });
  };

  useKeyboardOffset(keyboardOffset);

  return (
    <Animated.View style={{ flex: 1, paddingBottom: keyboardOffset }}>
      <ImageBackground
        source={require("../../assets/images/chatBG.png")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.8 }}
      >
        <FlatList
          data={messages}
          inverted
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <PrivateMessage
              item={item}
              prev={messages[index + 1] || null}
            />
          )}
          contentContainerStyle={styles.listContent}
        />

        {/* ===== Input ===== */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#888"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />

          {messageText.trim() !== "" && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});