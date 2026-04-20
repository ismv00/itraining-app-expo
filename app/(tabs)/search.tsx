import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../src/lib/api";

interface Personal {
  id: string;
  name: string;
  email: string;
}

interface ApprovedLink {
  id: string;
  personal: Personal;
}

export default function SearchScreen() {
  const [email, setEmail] = useState("");
  const [personal, setPersonal] = useState<Personal | null>(null);
  const [approvedLink, setApprovedLink] = useState<ApprovedLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useFocusEffect(
    useCallback(() => {
      checkApprovedLink();
    }, []),
  );

  async function checkApprovedLink() {
    setLoading(true);
    try {
      const { data } = await api.get("/links/approved");
      setApprovedLink(data);
    } catch {
      setApprovedLink(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!email) return;
    setSearching(true);
    setError("");
    setSuccess("");
    setPersonal(null);
    try {
      const { data } = await api.get("/users/find-personal", {
        params: { email },
      });
      setPersonal(data);
    } catch {
      setError("Personal não encontrado com esse e-mail.");
    } finally {
      setSearching(false);
    }
  }

  async function handleRequestLink() {
    if (!personal) return;
    setRequesting(true);
    setError("");
    try {
      await api.post("/links", { personalId: personal.id });
      setSuccess("Solicitação enviada! Aguarde a aprovação do personal.");
      setPersonal(null);
      setEmail("");
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || "Erro ao solicitar vínculo.");
    } finally {
      setRequesting(false);
    }
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C8F04C" />
      </View>
    );
  }

  // já tem vínculo aprovado
  if (approvedLink) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Meu personal</Text>
        <Text style={styles.subtitle}>
          Você já está vinculado a um personal trainer
        </Text>

        <View style={styles.personalCard}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(approvedLink.personal.name)}
              </Text>
            </View>
            <View style={styles.personalInfo}>
              <Text style={styles.personalName}>
                {approvedLink.personal.name}
              </Text>
              <Text style={styles.personalEmail}>
                {approvedLink.personal.email}
              </Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>vínculo ativo</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // sem vínculo — mostra busca
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Buscar personal</Text>
      <Text style={styles.subtitle}>
        Digite o e-mail do seu personal trainer
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="personal@email.com"
          placeholderTextColor="rgba(255,255,255,0.2)"
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            setError("");
            setSuccess("");
            setPersonal(null);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={handleSearch}
          disabled={searching}
        >
          {searching ? (
            <ActivityIndicator color="#0e0e0e" size="small" />
          ) : (
            <Text style={styles.searchBtnText}>Buscar</Text>
          )}
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {personal && (
        <View style={styles.personalCard}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(personal.name)}
              </Text>
            </View>
            <View style={styles.personalInfo}>
              <Text style={styles.personalName}>{personal.name}</Text>
              <Text style={styles.personalEmail}>{personal.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.requestBtn}
            onPress={handleRequestLink}
            disabled={requesting}
          >
            {requesting ? (
              <ActivityIndicator color="#0e0e0e" size="small" />
            ) : (
              <Text style={styles.requestBtnText}>Solicitar vínculo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!personal && !error && !success && (
        <View style={styles.hint}>
          <Text style={styles.hintText}>
            Após solicitar o vínculo, o personal precisará aprovar antes de você
            ter acesso aos treinos.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const ACCENT = "#C8F04C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e0e" },
  content: { padding: 24, paddingTop: 90 },
  centered: {
    flex: 1,
    backgroundColor: "#0e0e0e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 20,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 24,
  },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 13,
    fontSize: 18,
    color: "#fff",
    fontFamily: "DM_Sans_400Regular",
  },
  searchBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBtnText: { fontFamily: "Syne_700Bold", fontSize: 13, color: "#0e0e0e" },
  error: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: "#f87171",
    marginBottom: 12,
  },
  success: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: ACCENT,
    marginBottom: 12,
  },
  personalCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(200,240,76,0.15)",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(200,240,76,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Syne_800ExtraBold", fontSize: 14, color: ACCENT },
  personalInfo: { flex: 1 },
  personalName: {
    fontFamily: "Syne_700Bold",
    fontSize: 18,
    color: "#fff",
    marginBottom: 2,
  },
  personalEmail: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.3)",
  },
  requestBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 13,
    alignItems: "center",
  },
  requestBtnText: {
    fontFamily: "Syne_700Bold",
    fontSize: 16,
    color: "#0e0e0e",
  },
  badge: {
    backgroundColor: "rgba(200,240,76,0.1)",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  badgeText: { fontFamily: "DM_Sans_400Regular", fontSize: 11, color: ACCENT },
  hint: {
    marginTop: 32,
    padding: 16,
    backgroundColor: "#151515",
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
  },
  hintText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.25)",
    lineHeight: 18,
    textAlign: "center",
  },
});
