import { create } from 'zustand'

type Participant = {
    _id: string;
    name: string;
    publicKey: string;
};

type Contact = {
    _id: string;
    participants: Participant[];
};

type ContactsStore = {
    contacts: Contact[];
    addContact: (contact: Contact) => void;
    addAllContacts: (contact: Contact[]) => void;
    removeAllContacts: () => void;
};

export const useContactsStore = create<ContactsStore>((set) => ({
    contacts: [],
    addContact: (contact) => set((state) => ({
        contacts: [contact, ...state.contacts]
    })),
    addAllContacts: (contact) => set(() => ({
        contacts: [...contact]
    })),
    removeAllContacts: () => set({ contacts: [] }),
}))