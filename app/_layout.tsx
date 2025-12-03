import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, Component, useRef } from 'react';
import { useColorScheme } from '@/components/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { socket } from '@/socket/socket';
import { useContactsStore } from '@/store/contactsStore';
import { getContacts } from '@/Api/api';
import { newMessageHandel } from '@/socket/messageHandeler';
import { useUserStore } from '@/store/userStore';
import Toast from 'react-native-toast-message';
import { newRoomHandel } from '@/socket/roomHandeler';
import { View, Text, StyleSheet, ScrollView, Button, Alert, PermissionsAndroid, Platform } from 'react-native';
import { toastConfig } from '@/components/myComp/TostaConfig';
import * as Notifications from "expo-notifications";
import {
  getMessaging,
  getToken,
  onMessage,
  getInitialNotification,
  onNotificationOpenedApp,
  requestPermission,
  AuthorizationStatus
} from '@react-native-firebase/messaging';


export { ErrorBoundary } from 'expo-router';


export const unstable_settings = {
  initialRouteName: 'index',
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

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


// Custom ErrorBoundary Component
class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Error Boundary Caught:', error);
    console.error('📋 Error Info:', errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Text style={styles.errorTitle}>⚠️ Something went wrong</Text>
            <Text style={styles.errorMessage}>
              {this.state.error?.message || 'Unknown error occurred'}
            </Text>

            <ScrollView style={styles.errorStack}>
              <Text style={styles.errorStackText}>
                {this.state.error?.stack || 'No stack trace available'}
              </Text>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <Button title="Try Again" onPress={this.resetError} />
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}


export default function RootLayout() {
  const setAllContacts = useContactsStore(s => s.addAllContacts);
  const setUserData = useUserStore(s => s.setUser);
  const userToken = useUserStore(s => s.user.token);

  const rootNavigationState = useRootNavigationState();
  const lastHandledNotificationIdRef = useRef<string | null>(null);

  async function initialLoding() {
    try {
      let token = await AsyncStorage.getItem("token") || "";
      let id = await AsyncStorage.getItem('userId') || "";
      let name = await AsyncStorage.getItem('name') || "";

      console.log('🔑 Token loaded:', token ? 'Present' : 'Missing');

      if (!userToken) {
        setUserData({ id, name, token });
      }

      if (token) {
        try {
          console.log('📞 Fetching contacts...');
          const apiRes = await getContacts();
          setAllContacts(apiRes.rooms);

          apiRes.rooms.forEach((item: Contact) => {
            socket.emit("joinRoom", item._id);
          });
          console.log('✅ Contacts loaded successfully');
        } catch (error) {
          console.error("❌ Failed to load contacts:", error);
        }
      } else {
        console.log('🔄 No token, redirecting to login');
      }
    } catch (error) {
      console.error('❌ Error in initialLoding:', error);
    } finally {
      await SplashScreen.hideAsync();
      console.log('👋 Splash screen hidden');
    }
  }

  const requestUserPermission = async () => {
    try {
      if (Platform.Version >= "33") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs notification access to send you updates',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("📌 Notification permission granted");
          return true;
        } else {
          console.log("❌ Notification permission denied");
          return false;
        }
      }
      console.log("📌 Android <13: Permissions granted by default");
      return true;

    } catch (error) {
      console.log("🔥 Permission error:", error);
      return false;
    }
  };

  const connectSocket = async () => {
    try {
      let token = await AsyncStorage.getItem("token");
      let fcmToken = await AsyncStorage.getItem("fcmToken");

      if (token) {
        socket.auth = { token, fcmToken };
        socket.connect();

        socket.on("connect", () => {
          console.log("📡 Socket connected:", socket.id);
        });

        socket.on('receiveMessage', newMessageHandel);
        socket.on('receiveRoom', newRoomHandel);

        socket.on("disconnect", () => {
          console.log("❌ Socket disconnected");
        });
      }

      await initialLoding();
    } catch (error) {
      console.error('❌ Error in connectSocket:', error);
      await initialLoding();
    }
  }

  useEffect(() => {
    const messaging = getMessaging();
    let unsubscribeMessage: (() => void) | undefined;

    const initFCM = async () => {
      const permission = await requestUserPermission();

      if (permission) {
        const token = await getToken(messaging);
        AsyncStorage.setItem("fcmToken", token);
        console.log("📱 FCM Token:", token);
      }

      // Foreground messages
      unsubscribeMessage = onMessage(messaging, async (remoteMessage) => {
        Alert.alert("New Message", JSON.stringify(remoteMessage));
      });

      // App opened from quit
      const initial = await getInitialNotification(messaging);
      if (initial) {
        console.log("App opened from quit:", initial.notification);
      }

      // App opened from background
      onNotificationOpenedApp(messaging, (remoteMessage) => {
        console.log("App opened from background:", remoteMessage.notification);
      });
    };

    initFCM();

    return () => {
      if (unsubscribeMessage) unsubscribeMessage();
    };
  }, []);

  useEffect(() => {
    if (!rootNavigationState?.key) return;

    const handleResponse = (
      response: Notifications.NotificationResponse | null
    ) => {
      if (!response) return;

      const data = response.notification.request.content.data as any;
      const notificationId = response.notification.request.identifier;

      if (lastHandledNotificationIdRef.current === notificationId) {
        return;
      }
      lastHandledNotificationIdRef.current = notificationId;

      console.log("📩 Notification Clicked:", data);

      if (data?.newMessage && data?.id) {
        setTimeout(() => {
          router.push(`/(chat)/${data.id}`);
        }, 100);
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    handleResponse(lastResponse);

    const sub = Notifications.addNotificationResponseReceivedListener(
      handleResponse
    );

    return () => {
      sub.remove();
    };
  }, [rootNavigationState?.key]);




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

  return (
    <AppErrorBoundary>
      <RootLayoutNav />
    </AppErrorBoundary>
  );
}


function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false }} />
        <Toast config={toastConfig} />
      </SafeAreaView>
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContent: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorStack: {
    maxHeight: 200,
    backgroundColor: '#f1f3f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorStackText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 10,
  },
});