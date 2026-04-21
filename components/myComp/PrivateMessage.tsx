import { memo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export type Message = {
    sender: string;
    message: string;
    timestamp: string;
    own: boolean;
};

export const PrivateMessage = memo(function ({
    item,
    prev,
}: {
    item: Message;
    prev: Message | null;
}) {
    const showDate =
        !prev ||
        new Date(item.timestamp).toDateString() !==
        new Date(prev.timestamp).toDateString();

    return (
        <>
            {/* ===== Message ===== */}
            <View
                style={[
                    styles.messageContainer,
                    item.own ? styles.rightMessage : styles.leftMessage,
                ]}
            >
                {!item.own && (
                    <Image
                        source={{
                            uri: `https://avatar.iran.liara.run/public/boy?username=${item.sender}`,
                        }}
                        style={styles.avatar}
                    />
                )}

                <View
                    style={[
                        styles.messageBubble,
                        item.own ? styles.currentUserBubble : styles.otherUserBubble,
                    ]}
                >
                    {!item.own && (
                        <Text style={styles.senderName}>{item.sender}</Text>
                    )}

                    <Text style={styles.messageText}>{item.message}</Text>

                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </Text>
                </View>

                {item.own && (
                    <Image
                        source={{
                            uri: `https://avatar.iran.liara.run/public/boy?username=${item.sender}`,
                        }}
                        style={styles.avatar}
                    />
                )}
            </View>
            
            {/* ===== Date Separator ===== */}
            {showDate && (
                <View style={styles.dateMain}>
                    <Text style={styles.dateContainer}>
                        {new Date().toDateString() ===
                            new Date(item.timestamp).toDateString()
                            ? "Today"
                            : new Date(item.timestamp).toDateString()}
                    </Text>
                </View>
            )}
        </>
    );
});

const styles = StyleSheet.create({
    messageContainer: {
        flexDirection: "row",
        marginVertical: 6,
        marginHorizontal: 10,
        alignItems: "flex-end",
    },
    leftMessage: {
        justifyContent: "flex-start",
    },
    rightMessage: {
        justifyContent: "flex-end",
    },
    messageBubble: {
        maxWidth: "65%",
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 18,
    },
    currentUserBubble: {
        backgroundColor: "#AEFCD7",
        borderBottomRightRadius: 5,
    },
    otherUserBubble: {
        backgroundColor: "#E5E7EB",
        borderBottomLeftRadius: 5,
    },
    senderName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#374151",
        marginBottom: 2,
    },
    messageText: {
        fontSize: 16,
        color: "#000",
    },
    timestamp: {
        fontSize: 10,
        marginTop: 4,
        color: "#555",
        alignSelf: "flex-end",
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginHorizontal: 6,
    },
    dateMain: {
        alignItems: "center",
        marginVertical: 8,
    },
    dateContainer: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        fontSize: 11,
        borderRadius: 20,
        backgroundColor: "#A3A3A3",
        fontWeight: "600",
        color: "#000",
    },
});
