import { useRoomStore } from "@/store/roomStore";
import { Stack } from "expo-router";
import { Image, View } from "react-native";

export default function ChatLayout() {
  const userName = useRoomStore((s) => s.room.reciverName);
  return (
    <Stack
      screenOptions={{
        // headerTitle: userName,
        // headerStyle: {
        //     backgroundColor: "#fff",
        // },
        // headerTintColor: 'black',
        // headerRight: () => (
        //     <Image source={{ uri: `https://api.dicebear.com/10.x/adventurer-neutral/png?seed=${userName}` }} style={{ width: 40, height: 40, borderRadius: 25, marginRight: 15, borderWidth: 1 }} />
        // )
        headerShown: false,
      }}
    >
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
