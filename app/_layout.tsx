import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, Component } from 'react';
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
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { toastConfig } from '@/components/myComp/TostaConfig';


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
        // router.replace('/contacts');
      } else {
        console.log('🔄 No token, redirecting to login');
        // router.replace('/Login');
      }
    } catch (error) {
      console.error('❌ Error in initialLoding:', error);
    } finally {
      // Always hide splash screen
      await SplashScreen.hideAsync();
      console.log('👋 Splash screen hidden');
    }
  }

  const connectSocket = async () => {
    try {
      let token = await AsyncStorage.getItem("token");

      if (token) {
        socket.auth = { token };
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
      // Still try to load initial data even if socket fails
      await initialLoding();
    }
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
