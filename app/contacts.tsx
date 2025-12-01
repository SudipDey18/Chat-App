import { View, StatusBar, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import Contacts from '@/components/myComp/Contacts'
import { router } from 'expo-router'

const contacts = () => {

    return (
        <View style={style.maindiv}>
            <StatusBar hidden={false} />
            <Contacts />
        </View>
    )
}

const style = StyleSheet.create({
    maindiv: {
        flex: 1
    }
})

export default contacts