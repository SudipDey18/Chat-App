import { useMessagesStore } from "@/store/messageStore";
import { useRoomStore } from "@/store/roomStore";
import { useUserStore } from "@/store/userStore";
import Toast from 'react-native-toast-message';
import * as Notifications from "expo-notifications";

type sender = {
    "_id": string;
    "name": string;
}

type message = {
    _id: string;
    oldId: string;
    sender: sender;
    roomId: string,
    reciver: string;
    reciverMsg: string;
    senderMsg: string;
    createdAt: string;
}

export const newMessageHandel = async (data: message) => {
    const { _id, reciver, sender, createdAt, oldId, reciverMsg, senderMsg } = data;
    const room = useRoomStore.getState().room;
    const updateMessages = useMessagesStore.getState().setAllMessages;
    const addMessage = useMessagesStore.getState().setMessages;
    const messages = useMessagesStore.getState().messages;
    const loginUserId = useUserStore.getState().user.id;


    if (room.roomId == data.roomId) {
        if (loginUserId == sender._id) {
            updateMessages(messages.map((item) => {
                if (item._id == oldId) {
                    return {
                        ...item,
                        _id
                    }
                } else {
                    return item
                }
            }));
        } else {
            addMessage({ _id, createdAt, reciverMsg, senderMsg, reciver, sender });
        }
    } else {
        // Toast.show({
        //     type: 'success',
        //     text1: `New message Recived from ${sender.name}`,
        // });
        if (sender._id != loginUserId) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "You've got message! 💬",
                    body: `Message Recived from ${sender.name}`,
                    data: {
                        id: sender._id,
                        newMessage: true
                    }
                },
                trigger: null,
            });
        }

    }
}