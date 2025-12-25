import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { router } from 'expo-router'
import { KeyboardAvoidingView } from 'react-native'
import { useUserStore } from '@/store/userStore'
import { RSA } from 'react-native-rsa-native'
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message'

const addKey = () => {
    const updateKey = useUserStore(s => s.setUserPrivateKey);
    const publicKey = useUserStore(s => s.user.publicKey);
    const [loading, setLoading] = useState<boolean>(false);
    const [key, setKey] = useState<string>("");

    const addApiKey = async () => {
        setLoading(true);
        try {
            const eMessage = await RSA.encrypt("hi", publicKey);
            await RSA.decrypt(eMessage, key);
            updateKey(key);
            await SecureStore.setItemAsync('privateKey', key);
            router.replace('/contacts')

        } catch (error) {
            Toast.show({
                type: 'error',
                text1: `Invalid token Input.`,
            });
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {false ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" />
                    <Text>Loading Contacts...</Text>
                </View>
            ) : (
                <View style={styles.card}>
                    <Text style={styles.title}>Enter Key</Text>
                    <TextInput
                        style={{
                            fontSize: 13,
                            width: '100%',
                            borderWidth: 2,
                            borderColor: '#ac9d9dff',
                            borderRadius: 5,
                            maxHeight: 200,
                            paddingHorizontal: 10
                        }}
                        placeholder='Enter Key'
                        multiline
                        onChangeText={setKey}
                        value={key}
                    />

                    <TouchableOpacity style={[styles.button, loading && styles.disabledResendButton]} onPress={addApiKey} disabled={loading}>
                        <Text style={styles.buttonText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    )
}

export default addKey

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center'
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        margin: 5
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledResendButton: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#999'
    },
})