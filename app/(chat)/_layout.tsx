import { useRoomStore } from "@/store/roomStore";
import { Stack } from "expo-router";
import { Image, View } from "react-native";

export default function ChatLayout() {
    const userName = useRoomStore(s => s.room.reciverName);
    return (
        <Stack screenOptions={{
            headerTitle: userName,
            headerStyle: {
                backgroundColor: "#fff",
            },
            headerTintColor: 'black',
            headerRight: () => (
                <Image source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${userName}` }} style={{ width: 40, height: 40, borderRadius: 25, marginRight: 15, borderWidth: 1 }} />
            )
        }}>
            <Stack.Screen name="[id]" />
        </Stack>
    );
}
