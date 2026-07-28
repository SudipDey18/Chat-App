import {
  Text,
  StyleSheet,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Modal,
} from "react-native";
import { useState, useCallback, useRef, useEffect } from "react";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { socket } from "@/socket/socket";
import { useRoomStore } from "@/store/roomStore";
import { useUserStore } from "@/store/userStore";
import { useMessagesStore } from "@/store/messageStore";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useCameraPermissions } from "expo-camera";
// import { RSA } from "react-native-rsa-native";
import { publicEncrypt } from "react-native-quick-crypto";
import { Buffer } from "buffer";
import { RenderMessage } from "./RenderMessage";
import { Icon } from "@expo/ui";
import { MenuView, NativeActionEvent } from "@expo/ui/community/menu";
// import {
//   Host,
//   ModalBottomSheet,
//   Button,
//   Column,
// } from "@expo/ui/jetpack-compose";
// import type { ModalBottomSheetRef } from "@expo/ui/jetpack-compose";
// import { paddingAll } from "@expo/ui/jetpack-compose/modifiers";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import CameraComp from "./CameraComp";
import { KeyboardAvoidingView } from "react-native";
import ImagesComp from "./ImagesComp";

const camera = Icon.select({
  ios: "camera",
  android: import("@expo/material-symbols/photo_camera.xml"),
});

const addPhoto = Icon.select({
  ios: "photo.badge.plus",
  android: import("@expo/material-symbols/add_photo_alternate.xml"),
});

const addFile = Icon.select({
  ios: "text.page",
  android: import("@expo/material-symbols/attach_file_add.xml"),
});

const addAudio = Icon.select({
  ios: "music.note",
  android: import("@expo/material-symbols/music_note_add.xml"),
});

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

type fileOptionType = "image" | "camera" | "audio" | "file" | "";

export default function Messages({
  chatMessages,
}: {
  chatMessages: message[];
}) {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState("");
  const roomData = useRoomStore((s) => s.room);
  const setRoomData = useRoomStore((s) => s.setRoom);
  const loginUser = useUserStore((s) => s.user);
  const messages = useMessagesStore((s) => s.messages);
  const setMessages = useMessagesStore((s) => s.setAllMessages);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [visible, setVisible] = useState(false);
  const [fileOption, setFileOption] = useState<fileOptionType>("");

  useFocusEffect(
    useCallback(() => {
      setMessages(chatMessages);
      return () => {
        setRoomData({
          reciverId: "",
          reciverName: "",
          roomId: "",
          publicKey: "",
        });
      };
    }, []),
  );

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission();
    }
  }, [cameraPermission]);

  const handleSendMessage = async () => {
    if (messageText.trim() === "") return;

    const tempId = Date.now();
    const senderMsg = publicEncrypt(
      loginUser.publicKey,
      Buffer.from(messageText, "utf8"),
    ).toString("base64");
    const reciverMsg = publicEncrypt(
      roomData.publicKey,
      Buffer.from(messageText, "utf8"),
    ).toString("base64");

    if (!senderMsg && !reciverMsg) {
      return;
    }

    const tempMessage: message = {
      _id: tempId.toString(),
      senderMsg,
      reciverMsg,
      createdAt: new Date().toISOString(),
      reciver: id.toString(),
      sender: {
        _id: loginUser.id,
        name: loginUser.name,
      },
    };

    setMessages([tempMessage, ...messages]);
    setMessageText("");

    socket.emit(
      "sendMessage",
      {
        _id: tempId,
        roomId: roomData.roomId,
        senderMsg,
        reciverMsg,
        reciver: id,
        sender: {
          _id: loginUser.id,
          name: loginUser.name,
        },
      },
      (response: any) => {
        // console.log('Server responded:', response);
        if (response.success) {
          // console.log('Message sent successfully');
        }
      },
    );
  };

  const handelMeanuSelect = (e: NativeActionEvent) => {
    let option: fileOptionType = e.nativeEvent.event as fileOptionType;
    setFileOption(option);
    switch (option) {
      case "camera":
        setVisible(true);
        break;
      case "image":
        setVisible(true);
        console.log("image clicked");
        break;
      case "audio":
        break;
      case "file":
        break;
      default:
        Toast.show({
          text1: "Invalid option press",
          type: "error",
        });
    }
  };

  const showSendButton = messageText.trim() !== "";
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useKeyboardOffset(keyboardOffset);

  return (
    <Animated.View style={{ flex: 1, paddingBottom: keyboardOffset }}>
      <ImageBackground
        source={require("../../assets/images/bg.png")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.8 }}
      >
        <FlatList
          data={messages}
          renderItem={({ item, index }) => (
            <RenderMessage item={item} prev={messages[index + 1] || null} />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          inverted
        />

        <View style={styles.inputContainer}>
          <MenuView
            style={{
              height: 40,
              width: 40,
              borderRadius: 7,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "gray",
              marginRight: 10,
            }}
            actions={[
              { id: "camera", title: "Camera", image: camera },
              { id: "image", title: "Image", image: addPhoto },
              { id: "audio", title: "audio", image: addAudio },
              { id: "file", title: "File", image: addFile },
            ]}
            onPressAction={handelMeanuSelect}
          >
            <MaterialIcons name="attach-file" size={32} color="black" />
          </MenuView>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />

          {showSendButton && (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          )}
        </View>
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setVisible(false);
            setFileOption("");
          }}
        >
          {/*<KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >*/}
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              {fileOption === "camera" && <CameraComp />}
              {fileOption === "image" && <ImagesComp />}
            </View>
          </View>
          {/*</KeyboardAvoidingView>*/}
        </Modal>
      </ImageBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1, // CRITICAL: Makes background fill container
    width: "100%",
  },
  listContent: {
    paddingVertical: 10,
  },
  messageContainer: {
    flexDirection: "row",
    marginVertical: 5,
    marginHorizontal: 10,
    alignItems: "flex-end",
  },
  leftMessage: {
    justifyContent: "flex-start",
  },
  rightMessage: {
    justifyContent: "flex-end",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "60%",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  currentUserBubble: {
    backgroundColor: "#AEFCD7",
    borderBottomRightRadius: 5,
  },
  otherUserBubble: {
    backgroundColor: "#E5E5EA",
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  currentUserText: {
    color: "#000",
  },
  otherUserText: {
    color: "#000",
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    color: "#383838ff",
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "black",
  },
  sendButton: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sheet: {
    height: "90%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    padding: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
});
