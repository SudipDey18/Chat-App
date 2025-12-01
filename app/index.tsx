import { useUserStore } from '@/store/userStore'
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';


const index = () => {
    const userToken = useUserStore(s => s.user.token);

    useEffect(() => {
        if (userToken) {
            router.replace('/contacts');
        }
    }, [userToken])

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Please wait...</Text>
        </View>
    )
}

export default index