import { Text, StyleSheet, View, FlatList, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ImageBackground } from 'react-native'
import React, { useState, useCallback } from 'react'
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { socket } from '@/socket/socket';
import { useRoomStore } from '@/store/roomStore';
import { useUserStore } from '@/store/userStore';
import { useMessagesStore } from '@/store/messageStore';

type sender = {
  "_id": string;
  "name": string;
}

type message = {
  _id: string;
  sender: sender;
  reciver: string;
  message: string;
  createdAt: string;
}

export default function Messages({ chatMessages }: { chatMessages: message[] }) {
  const { id } = useLocalSearchParams();
  const [messageText, setMessageText] = useState('')
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const roomData = useRoomStore(s => s.room);
  const setRoomData = useRoomStore(s => s.setRoom);
  const loginUser = useUserStore(s => s.user);
  const messages = useMessagesStore(s => s.messages);
  const setMessages = useMessagesStore(s => s.setAllMessages);

  useFocusEffect(
    useCallback(() => {
      setMessages(chatMessages);

      const showListener = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
      const hideListener = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

      return () => {
        setRoomData({ reciverId: "", reciverName: "", roomId: "" });

        // clean listeners
        showListener.remove();
        hideListener.remove();
      };
    }, [chatMessages])
  );

  const handleSendMessage = async () => {
    if (messageText.trim() === '') return;

    const tempId = Date.now();

    const tempMessage: message = {
      _id: tempId.toString(),
      message: messageText,
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
      message: messageText,
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


  const renderMessage = ({ item }: { item: message }) => {
    const isCurrentUser = loginUser.id === item.sender._id


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
            {item.message}
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
    )
  }

  const showSendButton = messageText.trim() !== ''

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVisible ? 90 : 0}
    >
      <ImageBackground source={require('../../assets/images/bg.png')} style={styles.mainContainer} imageStyle={{ opacity: 0.8 }}>
        <FlatList
          data={messages}
          renderItem={renderMessage}
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
    </KeyboardAvoidingView>
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
    opacity: 0.7
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100
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
