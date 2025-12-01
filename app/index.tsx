import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect,} from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';


const index = () => {
    const [route, setRoute] = useState<string | null>(null)

    const initialSetup = async () => {
        const token = await AsyncStorage.getItem("token");

        if (token) {
            setRoute("token");
        } else {
            setRoute("noToken");
        }
    }

    useEffect(() => {
        initialSetup();
    }, [])

    if (route == "token") {
        return <Redirect href="/contacts" />;
    }
    if (route == "noToken") {
        return <Redirect href="/Login" />;
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Please wait...</Text>
        </View>
    )
}

export default index