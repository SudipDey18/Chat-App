import { create } from 'zustand'

type UserData = {
    id: string;
    name: string;
    token: string;
};

type UserStore = {
    user: UserData,
    setUser: (user: UserData) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: { id: "", name: "" , token: ""},
    setUser: (user) => set(() => ({
        user
    }))
}))