import { Text, StyleSheet, View, FlatList, Image, TextInput, TouchableOpacity, ImageBackground, Animated } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { socket } from '@/socket/socket';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { useMessagesStore } from '@/store/messageStore';
import { useKeyboardOffset } from '@/hooks/useKeyboardOffset';
import { RSA } from 'react-native-rsa-native';
import { RenderMessage } from './RenderMessage';

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

export default function Messages({ chatMessages }: { chatMessages: message[] }) {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('')
  const roomData = useRoomStore(s => s.room);
  const setRoomData = useRoomStore(s => s.setRoom);
  const loginUser = useUserStore(s => s.user);
  const messages = useMessagesStore(s => s.messages);
  const setMessages = useMessagesStore(s => s.setAllMessages);

  useFocusEffect(
    useCallback(() => {
      setMessages(chatMessages);
      return () => {
        setRoomData({ reciverId: "", reciverName: "", roomId: "", publicKey: "" });
      };
    }, [])
  );

  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;

    const tempId = Date.now();
    const senderMsg = await RSA.encrypt(messageText, loginUser.publicKey);
    const reciverMsg = await RSA.encrypt(messageText, roomData.publicKey);

    if (!senderMsg && !reciverMsg) {
      return
    }

    const tempMessage: message = {
      _id: tempId.toString(),
      senderMsg,
      reciverMsg,
      createdAt: new Date().toISOString(),
      reciver: id.toString(),
      sender: {
        _id: loginUser.id,
        name: loginUser.name
      }
    };

    setMessages([tempMessage, ...messages]);
    setMessageText('');

    socket.emit('sendMessage', {
      _id: tempId,
      roomId: roomData.roomId,
      senderMsg,
      reciverMsg,
      reciver: id,
      sender: {
        _id: loginUser.id,
        name: loginUser.name
      }
    }, (response: any) => {
      // console.log('Server responded:', response);
      if (response.success) {
        // console.log('Message sent successfully');
      }
    });
  };

  const showSendButton = messageText.trim() !== '';
  const keyboardOffset = useRef(new Animated.Value(0)).current;

  useKeyboardOffset(keyboardOffset);

  return (
    <Animated.View style={{ flex: 1, paddingBottom: keyboardOffset }}>
      <ImageBackground source={require('../../assets/images/bg.png')} style={styles.backgroundImage} imageStyle={{ opacity: 0.8 }}>
        <FlatList
          data={messages}
          renderItem={({ item }) => <RenderMessage item={item} />}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          inverted
        />

        <View style={styles.inputContainer}>
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
      </ImageBackground>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,  // CRITICAL: Makes background fill container
    width: '100%',
  },
  listContent: {
    paddingVertical: 10,
  },
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
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: "black"
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginLeft: 10
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})
