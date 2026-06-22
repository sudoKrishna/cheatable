import { useLayoutEffect, useRef } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { ChatBubble } from "@/components/ChatBubble";
import { PromptInput } from "@/components/PromptInput";
import { useProject } from "@/hooks/useProject";
import { useChatStream } from "@/hooks/useChatStream";
import { useProjectStore } from "@/store/projectStore";

export default function ChatScreen() {
  const { projectId, projectName } = useLocalSearchParams<{
    projectId: string;
    projectName: string;
  }>();
  const router = useRouter();
  const navigation = useNavigation();

  const { isLoading, error: loadError } = useProject(projectId);
  const { sendPrompt, error: streamError } = useChatStream(projectId);

  const messages = useProjectStore((s) => s.messages);
  const isGenerating = useProjectStore((s) => s.isGenerating);
  const statusText = useProjectStore((s) => s.statusText);
  const activeProject = useProjectStore((s) => s.activeProject);

  const listRef = useRef<FlatList>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: projectName,
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/preview/[projectId]",
              params: {
                projectId,
                previewUrl: activeProject?.previewUrl ?? ""
              }
            })
          }
        >
          <Text style={styles.headerLink}>Preview</Text>
        </TouchableOpacity>
      )
    });
  }, [navigation, router, projectName, projectId, activeProject?.previewUrl]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {(loadError || streamError) && (
        <Text style={styles.errorBanner}>{loadError ?? streamError}</Text>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {isGenerating && statusText && (
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}

      <PromptInput onSubmit={sendPrompt} isGenerating={isGenerating} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    color: "#71717a",
    fontSize: 14
  },
  listContent: {
    paddingVertical: 12
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#eff6ff"
  },
  statusText: {
    fontSize: 13,
    color: "#2563eb"
  },
  errorBanner: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  headerLink: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "600"
  }
});