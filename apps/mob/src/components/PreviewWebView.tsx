import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { LoadingOverlay } from "./LoadingOverlay";

interface PreviewWebViewProps {
  previewUrl: string | null;
  refreshKey?: number;
}

export function PreviewWebView({ previewUrl, refreshKey }: PreviewWebViewProps) {
  if (!previewUrl) {
    return (
      <View style={styles.container}>
        <LoadingOverlay label="Starting sandbox..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        key={`${previewUrl}-${refreshKey ?? 0}`}
        source={{ uri: previewUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => <LoadingOverlay label="Loading preview..." />}
        originWhitelist={["*"]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  webview: {
    flex: 1
  }
});
