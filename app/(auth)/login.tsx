import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api, setAuthToken } from "../../src/lib/api";
import { ApiError } from "../../src/types/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", loginData);
      await SecureStore.setItemAsync("token", data.token);
      setAuthToken(data.token);
      router.replace("/(tabs)/home");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { ...registerData, role: "STUDENT" });
      setSuccess("Conta criada! Faça login para continuar.");
      setTab("login");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.error || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>
          i<Text style={styles.logoAccent}>Training</Text>
        </Text>

        {/* tabs */}
        <View style={styles.tabs}>
          {(["login", "register"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "login" ? "Entrar" : "Criar conta"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {success ? <Text style={styles.success}>{success}</Text> : null}

        {tab === "login" ? (
          <View>
            <Text style={styles.title}>Bem-vindo de volta</Text>
            <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

            <Field label="E-mail">
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={loginData.email}
                onChangeText={(v) => setLoginData({ ...loginData, email: v })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            <Field label="Senha">
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={loginData.password}
                onChangeText={(v) =>
                  setLoginData({ ...loginData, password: v })
                }
                secureTextEntry
              />
            </Field>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0e0e0e" />
              ) : (
                <Text style={styles.btnText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <Text style={styles.divider}>ou</Text>
            </View>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => setTab("register")}
            >
              <Text style={styles.btnOutlineText}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece sua jornada agora</Text>

            <Field label="Nome completo">
              <TextInput
                style={styles.input}
                placeholder="João Silva"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={registerData.name}
                onChangeText={(v) =>
                  setRegisterData({ ...registerData, name: v })
                }
              />
            </Field>

            <Field label="E-mail">
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={registerData.email}
                onChangeText={(v) =>
                  setRegisterData({ ...registerData, email: v })
                }
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Field>

            <Field label="Senha">
              <TextInput
                style={styles.input}
                placeholder="mín. 6 caracteres"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={registerData.password}
                onChangeText={(v) =>
                  setRegisterData({ ...registerData, password: v })
                }
                secureTextEntry
              />
            </Field>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.btn}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#0e0e0e" />
              ) : (
                <Text style={styles.btnText}>Criar conta</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const ACCENT = "#C8F04C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e0e" },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60 },
  logo: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  logoAccent: { color: ACCENT },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.05)",
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: ACCENT },
  tabText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.25)",
  },
  tabTextActive: { color: ACCENT },
  title: {
    fontFamily: "Syne_700Bold",
    fontSize: 22,
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 24,
  },
  fieldLabel: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 13,
    fontSize: 13,
    color: "#fff",
    fontFamily: "DM_Sans_400Regular",
  },
  btn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { fontFamily: "Syne_700Bold", fontSize: 14, color: "#0e0e0e" },
  btnOutline: {
    borderWidth: 0.5,
    borderColor: "rgba(200,240,76,0.3)",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  btnOutlineText: { fontFamily: "Syne_700Bold", fontSize: 14, color: ACCENT },
  dividerRow: { alignItems: "center", marginVertical: 12 },
  divider: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.1)",
  },
  error: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "#f87171",
    marginBottom: 8,
  },
  success: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: ACCENT,
    marginBottom: 12,
  },
});
