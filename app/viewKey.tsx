import { FontAwesome6 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

const viewKey = () => {
    const [key, setKey] = useState('');

    useEffect(() => {
        let fun = async () => {
            const privateKey = await SecureStore.getItemAsync('privateKey');
            setKey(privateKey || '');
        }
        fun();
    })

    const copyCode = async () => {

        await Clipboard.setStringAsync(key);

        Toast.show({
            type: 'success',
            text1: "Key copy successfully.",
        });
    }

    return (
        <View style={{display: 'flex', height: '100%', justifyContent: 'center'}}>
            <View style={styles.card}>
                <Text style={styles.title}>Save Key</Text>
                <Text style={styles.subtitle}>Save your key for login into another device.</Text>

                <ScrollView
                    nestedScrollEnabled
                    style={{ maxHeight: 200, borderWidth: 1, borderColor: '#ddd', borderRadius: 10 }}
                    contentContainerStyle={styles.keyBox}
                >
                    <Text
                        style={{
                            fontSize: 13,
                            color: "#1507b1ff",
                            fontWeight: 'bold',
                            flexShrink: 0,
                            width: 'auto'
                        }}
                    >
                        {key}
                    </Text>
                </ScrollView>

                <TouchableOpacity onPress={copyCode} style={styles.copyButton}>
                    <FontAwesome6 name='copy' size={22} color='black' />
                    <Text style={{ color: 'black', fontSize: 18, fontWeight: '600' }}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => router.back()}>
                    <Text style={styles.buttonText}>Back</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default viewKey

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#333',
        marginBottom: 10
    },
    keyBox: {
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
        color: "black",
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    copyButton: {
        backgroundColor: '#0aab45ff',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 4
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600'
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30
    },
})