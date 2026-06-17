import { useRoute } from "expo-router";
import { useState } from "react";
import { Text , View , TextInput, Pressable , StyleSheet ,Alert} from "react-native";

export default function () {
    const [email  , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [loading , setLoading] = useState(false);

    async function handelLogin() {
        try {
            setLoading(true) ;
    
            const res = await fetch("http://localhost:3000/login" ,  {
                method : "POST",
                headers : {"Content-Type" : "application/json"},
                body : JSON.stringify({email , password}), 
            });
            const data = await res.json();
    
            if(res.ok) {
                Alert.alert("Error", data.error ?? "Something")
                return ;
            }
            Alert.alert("Success" , "Accoutn created");
        } catch (e) {
            Alert.alert("Error" , "could not react the server") 
        } finally {
            setLoading(false);
        }
    }
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Login
            </Text>
            <TextInput style={styles.input} placeholder="Email" 
             autoCapitalize="none"
              keyboardType="email-address"
               value={email} 
            onChangeText={setEmail} />
            <TextInput style={styles.input} 
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            />

            <Pressable style={styles.button} onPress={handelLogin} disabled={loading}>
                <Text style={styles.buttonText}>
                    {loading ? "..." : "Sign In"}
                </Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: "600", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
  button: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  link: { color: "#555", textAlign: "center", marginTop: 8 },
});