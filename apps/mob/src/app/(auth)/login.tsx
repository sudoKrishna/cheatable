import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { apiPost } from "@/api/client";
import { setToken } from "@/api/tokenStorage";

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter your email and password");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost<AuthResponse>("/api/auth/login", {
        email: email.trim(),
        password
      });

      await setToken(data.token);
      router.replace("/");
    } catch (e) {
      Alert.alert("Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "..." : "Sign In"}</Text>
      </Pressable>

      <Link href="/signup" asChild>
        <Pressable>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  button: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#555", textAlign: "center", marginTop: 8 }
});