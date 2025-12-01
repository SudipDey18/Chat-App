import { create } from 'zustand'

type UserData = {
    id: string;
    name: string;
    token: string;
};

type UserStore = {
    user: UserData,
    setUser: (user: UserData) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: { id: "", name: "", token: "" },
    setUser: (user) => set(() => ({
        user
    })),
    clearUser: ()=>set(()=>({
        user: { id: "", name: "", token: "" }
    }))
}))