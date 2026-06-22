import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingOverlayProps {
  label: string;
}

export function LoadingOverlay({ label }: LoadingOverlayProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    gap: 12
  },
  label: {
    fontSize: 14,
    color: "#71717a"
  }
});
