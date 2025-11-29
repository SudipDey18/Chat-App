import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { socket } from '@/socket/socket';
import { useContactsStore } from '@/store/contactsStore';
import { getContacts } from '@/Api/api';
import { newMessageHandel } from '@/socket/messageHandeler';
import { useUserStore } from '@/store/userStore';
import ToastManager from 'toastify-react-native'
import { newRoomHandel } from '@/socket/roomHandeler';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'contacts',
};

SplashScreen.preventAutoHideAsync();

type Participant = {
  _id: string;
  name: string;
};

type Contact = {
  _id: string;
  participants: Participant[];
};

export default function RootLayout() {
  const setAllContacts = useContactsStore(s => s.addAllContacts);
  const setUserData = useUserStore(s => s.setUser);
  const userToken = useUserStore(s => s.user.token);

  async function initialLoding() {
    let token = await AsyncStorage.getItem("token") || "";
    let id = await AsyncStorage.getItem('userId') || "";
    let name = await AsyncStorage.getItem('name') || "";

    if (!userToken) {
      setUserData({ id, name, token });
    }

    if (token) {
      try {
        const apiRes = await getContacts();
        setAllContacts(apiRes.rooms);

        apiRes.rooms.forEach((item: Contact) => {
          socket.emit("joinRoom", item._id);
        });
      } catch (error) {
        console.error("Failed to load contacts:", error);
      }
    } else {
      router.replace('/Login');
    }

    // Always hide splash screen, regardless of token
    SplashScreen.hideAsync();
  }

  const connectSocket = async () => {
    let token = await AsyncStorage.getItem("token");

    if (token) {
      socket.auth = { token };
      socket.connect();

      socket.on("connect", () => {
        console.log("📡 Socket connected:", socket.id);
      });

      socket.on('receiveMessage', newMessageHandel);

      socket.on('receiveRoom',newRoomHandel);

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });
    }

    // Call initial loading regardless
    await initialLoding();
  }

  useEffect(() => {
    connectSocket();

    return () => {
      socket.off("connect");
      socket.off("receiveMessage");
      socket.off("disconnect");
      socket.off("receiveRoom");
      socket.disconnect();
    };
  }, [userToken]);

  return <RootLayoutNav />;
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();
  // console.log(colorScheme);


  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }} />
        <ToastManager />
      </SafeAreaView>
    </ThemeProvider>
  );
}
