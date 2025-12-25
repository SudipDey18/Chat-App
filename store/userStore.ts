import { create } from 'zustand'

type UserData = {
    id: string;
    name: string;
    token: string;
    publicKey: string;
    privateKey: string;
};

type UserStore = {
    user: UserData,
    setUser: (user: UserData) => void;
    setUserPrivateKey: (key: string) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: { id: "", name: "", token: "", publicKey: "", privateKey: "" },
    setUser: (user) => set(() => ({
        user
    })),
    setUserPrivateKey: (key) => set((prev) => ({
        user: { ...prev.user, privateKey: key }
    })),
    clearUser: () => set(() => ({
        user: { id: "", name: "", token: "", publicKey: "", privateKey: "" }
    }))
}))