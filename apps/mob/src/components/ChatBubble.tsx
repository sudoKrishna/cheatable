import {StyleSheet , Text ,View , TouchableOpacity} from "react-native";
import type {Message} from "../types";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";


interface ChatBubbleProps {
    message : Message ;
}

const copyMessage = async (text: string) => {
  await Clipboard.setStringAsync(text);
};

export function ChatBubble({message} : ChatBubbleProps ){
    const isUser = message.role === "user";

    return (
        <View style={[styles.messageContainer, isUser ? styles.rowRight : styles.rowLeft]}>
  
  <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
    <Text style={isUser ? styles.userText : styles.assistantText}>
      {message.content}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.copyButton}
    onPress={() => copyMessage(message.content)}
  >
    <MaterialCommunityIcons name="content-copy" size={18} color="#666" />
  </TouchableOpacity>

</View>
    );
}

const styles = StyleSheet.create({
    row : {
        width : "100%",
        paddingHorizontal : 12,
        marginVertical : 4
    },
    messageContainer: {
  width: "100%",
  paddingHorizontal: 12,
  marginVertical: 4,
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
        borderTopLeftRadius: 16,
        borderTopRightRadius : 16,
        borderBottomLeftRadius : 16,
        borderBottomRightRadius : 0,
        backgroundColor : "#f8f6f6"
    },
    assistantBubble : {
        backgroundColor : "#f1f1f4",
        borderTopLeftRadius : 16,
        borderTopRightRadius : 16,
        borderBottomLeftRadius : 0,
        borderBottomRightRadius :16
    },
    userText: {
    color: "#000000",
    fontSize: 15,
    lineHeight: 20
  },
  copyButton : {
    alignSelf : "flex-end",
    marginTop : 6,
  },
  assistantText: {
    color: "#18181b",
    fontSize: 15,
    lineHeight: 20
  }
})