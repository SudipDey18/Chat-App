import { create } from "zustand";

type PrivateRoomStore = {
    roomId: string,
    setRoomId: (roomId: string) => void;
}

export const usePrivateRoomStore = create<PrivateRoomStore>((set) => ({
    roomId: "",
    setRoomId: (id) => set(() => ({
        roomId: id
    }))
}))