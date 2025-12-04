import { create } from "zustand";

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

type MessageStore = {
    messages: message[],
    setMessages: (message: message) => void;
    setAllMessages: (messages: message[]) => void;
}

export const useMessagesStore = create<MessageStore>((set) => ({
    messages: [],
    setMessages: (message) => set((prev) => ({ messages: [message, ...prev.messages] })),
    setAllMessages: (messages) => set({ messages })
}))