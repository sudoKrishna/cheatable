import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PreviewWebView } from "@/components/PreviewWebView";
import { useProjectStore } from "@/store/projectStore";

export default function PreviewScreen() {
  const { previewUrl: initialPreviewUrl } = useLocalSearchParams<{
    projectId: string;
    previewUrl: string;
  }>();
  const storePreviewUrl = useProjectStore((s) => s.activeProject?.previewUrl ?? null);
  const [refreshKey, setRefreshKey] = useState(0);

  const previewUrl = storePreviewUrl ?? (initialPreviewUrl || null);

  return (
    <View style={styles.container}>
      <PreviewWebView previewUrl={previewUrl} refreshKey={refreshKey} />
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => setRefreshKey((k) => k + 1)}
      >
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  refreshButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#18181b",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10
  },
  refreshText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600"
  }
});