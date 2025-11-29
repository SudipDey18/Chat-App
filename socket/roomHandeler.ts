import { useContactsStore } from "@/store/contactsStore";
import { useRoomStore } from "@/store/roomStore";
import { socket } from "./socket";

type Participant = {
    _id: string;
    name: string;
};

type Contact = {
    _id: string;
    participants: Participant[];
};

export const newRoomHandel = async (data: Contact) => {

    const roomData = useRoomStore.getState().room;
    const setRoomId = useRoomStore.getState().setRoomId;
    const addContact = useContactsStore.getState().addContact;
    
    if (roomData.reciverId == data.participants[0]._id) {
        setRoomId(data._id);
    }
    socket.emit("joinRoom", data._id);
    addContact(data);
}