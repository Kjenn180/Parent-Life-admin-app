import { createBaby } from "../src/services/babyService";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../src/lib/firebase";
import { ensureUserAndHousehold } from "../src/services/householdService";



export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [babyName, setBabyName] = useState("");
  const [babyDob, setBabyDob] = useState("");


  // 🔐 Listen for login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // 🏠 Ensure household exists for user
  useEffect(() => {
    const run = async () => {
      if (!user?.uid || !user.email) return;
  
      try {
        console.log("Creating / fetching household...");
        const hid = await ensureUserAndHousehold(user.uid, user.email);
        setHouseholdId(hid);
        console.log("Household ready:", hid);
      } catch (e: any) {
        console.log("HOUSEHOLD ERROR:", e?.message || e);
        Alert.alert(
          "Connection issue",
          "Could not reach database. Check internet and try again."
        );
      }
    };
  
    run();
  }, [user]);
  

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

  const handleCreateBaby = async () => {
    // 🛡 VALIDATION GUARD (goes FIRST)
    if (!householdId) return;
  
    if (!babyName.trim()) {
      return Alert.alert("Missing info", "Please enter a baby name.");
    }
  
    if (!/^\d{4}-\d{2}-\d{2}$/.test(babyDob)) {
      return Alert.alert(
        "Invalid DOB",
        "Use format YYYY-MM-DD (example: 2024-05-28)"
      );
    }
  
    // ✅ If validation passes, continue to database
    try {
      await createBaby(householdId, babyName, babyDob);
      Alert.alert("Success", "Baby profile created!");
      setBabyName("");
      setBabyDob("");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };
  
  
  // ✅ Logged in UI
  if (user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard ✅</Text>

        <Text style={styles.sub}>Logged in as:</Text>
        <Text style={styles.email}>{user.email}</Text>

        <Text style={styles.sub}>Household ID:</Text>
        <Text style={styles.email}>{householdId ?? "Connecting to database..."}</Text>
        <Text style={styles.sub}>Create Baby Profile</Text>

<TextInput
  style={styles.input}
  placeholder="Baby name"
  value={babyName}
  onChangeText={setBabyName}
/>

<TextInput
  style={styles.input}
  placeholder="DOB (YYYY-MM-DD)"
  value={babyDob}
  onChangeText={setBabyDob}
/>

<Pressable style={styles.button} onPress={handleCreateBaby}>
  <Text style={styles.buttonText}>Add Baby</Text>
</Pressable>

        <Pressable style={styles.button} onPress={logout}>
          <Text style={styles.buttonText}>Log out</Text>
        </Pressable>

        <Text style={styles.note}>
          Next: Create Baby Profile
        </Text>
      </View>
    );
  }

  // ❌ Logged out UI
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
