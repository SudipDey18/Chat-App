import { View, Text, StatusBar, StyleSheet } from 'react-native'
import React from 'react'
import Messages from '@/components/myComp/Messages'
import Contacts from '@/components/myComp/Contacts'


const index = () => {
    return (
        <View style={style.maindiv}>
            <StatusBar hidden={false} />
            {/* <Messages /> */}
            {/* <Contacts/> */}
        </View>
    )
}

const style = StyleSheet.create({
    maindiv: {
        flex: 1
    }
})

export default index