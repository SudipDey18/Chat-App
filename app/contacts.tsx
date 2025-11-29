import { View, StatusBar, StyleSheet } from 'react-native'
import React from 'react'
import Contacts from '@/components/myComp/Contacts'

const index = () => {
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

export default index