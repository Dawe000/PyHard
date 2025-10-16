import { useLogin } from "@privy-io/expo/ui";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function PrivyUI() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useLogin();
  
  const handleLogin = async (loginMethod: string) => {
    setIsLoading(true);
    setError("");
    
    try {
      const session = await login({ 
        loginMethods: [loginMethod],
        appearance: {
          theme: "light",
          accentColor: "#6366f1",
        }
      });
      console.log("User logged in", session.user);
    } catch (err: any) {
      setError(err.message || "Login failed");
      Alert.alert("Login Error", err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Privy Login Options</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, styles.emailButton]}
          onPress={() => handleLogin("email")}
          disabled={isLoading}
        >
          <Ionicons name="mail" size={20} color="#fff" />
          <Text style={styles.buttonText}>Email Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, styles.googleButton]}
          onPress={() => handleLogin("google_oauth")}
          disabled={isLoading}
        >
          <Ionicons name="logo-google" size={20} color="#fff" />
          <Text style={styles.buttonText}>Google Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, styles.appleButton]}
          onPress={() => handleLogin("apple")}
          disabled={isLoading}
        >
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.buttonText}>Apple Login</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  emailButton: {
    backgroundColor: '#6366f1',
  },
  googleButton: {
    backgroundColor: '#db4437',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 12,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    flex: 1,
  },
});
