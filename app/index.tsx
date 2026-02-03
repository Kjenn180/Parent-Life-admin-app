import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../src/lib/firebase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Account created!");
    } catch (e: any) {
      Alert.alert("Signup failed", `${e?.code}\n\n${e?.message}`);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      Alert.alert("Success", "Logged in!");
    } catch (e: any) {
      Alert.alert("Login failed", `${e?.code}\n\n${e?.message}`);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text>Loading...</Text>
      </View>
    );
  }

  // ✅ Logged in UI
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard ✅</Text>
        <Text style={styles.sub}>Logged in as:</Text>
        <Text style={styles.email}>{user.email}</Text>

        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>

        <Text style={styles.note}>
          Next: Household + baby profile + event logging.
        </Text>
      </View>
    );
  }

  // ✅ Logged out UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Life Admin</Text>

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
        placeholder="Password (6+ chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={styles.button} onPress={signup}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={login}>
        <Text style={styles.buttonText}>Log In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  container: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  sub: { textAlign: "center" },
  email: { textAlign: "center", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 },
  button: { backgroundColor: "black", padding: 14, borderRadius: 10, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
  note: { marginTop: 16, textAlign: "center", opacity: 0.7 },
});
