import { create } from "zustand";

type RoomData = {
    roomId: string;
    reciverId: string;
    reciverName: string;
    publicKey: string;
}

type RoomStore = {
    room: RoomData,
    setRoom: (room: RoomData) => void;
    setRoomId: (id: string) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
    room: { reciverId: "", roomId: "", reciverName: "", publicKey: "" },
    setRoom: (room) => set(() => ({
        room
    })),
    setRoomId: (id) => set((state) => ({
        room: { ...state.room, roomId: id }
    }))
}))