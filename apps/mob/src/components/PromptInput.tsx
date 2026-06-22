import { useState } from "react";
import { ActivityIndicator , Platform ,StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Text } from "react-native";

interface PromptInputProps {
    onSubmit : (text : string) => void;
    isGenerating : boolean;
}

export function PromptInput({onSubmit , isGenerating} : PromptInputProps) {
    const [value , setValue ] = useState("");

    function handleSend() {
        const trimmed = value.trim();
        if(!trimmed || isGenerating) return;
        onSubmit(trimmed);
        setValue("");
    }

    return (
        <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Describe what to build or change..."
        placeholderTextColor="#9999a3"
        multiline
        editable={!isGenerating}
      />
      <TouchableOpacity
        style={[styles.sendButton, isGenerating && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <Text style={styles.sendText}>Send</Text>
        )}
      </TouchableOpacity>
    </View>
    )
}

const styles = StyleSheet.create({
    container : {
        flexDirection : "row",
        alignItems : "flex-end",
        paddingHorizontal : 12,
        paddingVertical : 10,
        paddingBottom : Platform.OS === "ios" ? 24 :12,
        borderTopWidth :1,
        borderTopColor : "#ffffff",
        backgroundColor : "#ffffff"
    },
    input : {
        flex : 1,
        maxHeight : 120,
        minHeight : 40,
        borderRadius :20,
        backgroundColor : "#f1f1f4",
        paddingHorizontal : 16,
        paddingVertical : 10,
        fontSize : 15,
    },
    sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  sendButtonDisabled: {
    backgroundColor: "#a3bffa"
  },
  sendText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600"
  }
});
