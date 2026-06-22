import {StyleSheet , Text ,View} from "react-native";
import type {Message} from "../types";

interface ChatBubbleProps {
    message : Message ;
}

export function ChatBubble({message} : ChatBubbleProps ){
    const isUser = message.role === "user";

    return (
        <View style={[styles.row, isUser ? styles.rowRight : styles.rowLeft]}>
        <View  style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
         <Text style={[isUser ? styles.userText : styles.assistantText]}>
            {message.content}
         </Text>
        </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row : {
        width : "100%",
        paddingHorizontal : 12,
        marginVertical : 4
    },
    rowLeft : {
        alignItems : "flex-start"
    },
    rowRight : {
        alignItems : "flex-end"
    },
    bubble : {
        maxWidth : "82%",
        borderRadius : 16,
        paddingVertical : 10,
        paddingHorizontal : 14
    },
    userBubble : {
        backgroundColor : "#2563eb"
    },
    assistantBubble : {
        backgroundColor : "#f1f1f4"
    },
    userText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 20
  },
  assistantText: {
    color: "#18181b",
    fontSize: 15,
    lineHeight: 20
  }
})