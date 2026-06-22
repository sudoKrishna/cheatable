import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter, Link } from "expo-router";
import { apiPost } from "@/api/client";
import { setToken } from "@/api/tokenStorage";

interface AuthResponse {
  token: string;
  user: { id: string; email: string };
}

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!email.trim() || password.length < 8) {
      Alert.alert("Error", "Please enter a valid email and a password of at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost<AuthResponse>("/api/auth/signup", {
        email: email.trim(),
        password
      });

      await setToken(data.token);
      router.replace("/");
    } catch (e) {
      Alert.alert("Error", "Could not create account. The email may already be in use.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
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

      <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "..." : "Sign up"}</Text>
      </Pressable>

      <Link href="/login" asChild>
        <Pressable>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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