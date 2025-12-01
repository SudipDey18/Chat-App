import { useMessagesStore } from "@/store/messageStore";
import { useRoomStore } from "@/store/roomStore";
import { useUserStore } from "@/store/userStore";
import Toast from 'react-native-toast-message';

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
    message: string;
    createdAt: string;
}

export const newMessageHandel = async (data: message) => {
    const { _id, message, reciver, sender, createdAt, oldId } = data;
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
            addMessage({ _id, createdAt, message, reciver, sender });
        }
    } else {
        Toast.show({
            type: 'success',
            text1: `New message Recived from ${sender.name}`,
        });
    }
}