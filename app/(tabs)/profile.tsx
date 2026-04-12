import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, clearAuthToken } from "../../src/lib/api";

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface ApprovedLink {
  id: string;
  createdAt: string;
  personal: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [approvedLink, setApprovedLink] = useState<ApprovedLink | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  async function fetchData() {
    setLoading(true);
    try {
      const [meRes, linkRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/links/approved"),
      ]);
      setMe(meRes.data);
      setApprovedLink(linkRes.data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          clearAuthToken();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#C8F04C" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil</Text>

      {/* avatar e nome */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {me?.name ? getInitials(me.name) : "?"}
          </Text>
        </View>
        <Text style={styles.name}>{me?.name}</Text>
        <Text style={styles.email}>{me?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>aluno</Text>
        </View>
      </View>

      {/* personal vinculado */}
      {approvedLink && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal trainer</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <View style={styles.avatarSm}>
                <Text style={styles.avatarSmText}>
                  {getInitials(approvedLink.personal.name)}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>
                  {approvedLink.personal.name}
                </Text>
                <Text style={styles.cardSub}>
                  {approvedLink.personal.email}
                </Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>
                Vinculado desde {formatDate(approvedLink.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* informações da conta */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <View style={styles.card}>
          {[
            { label: "Nome", value: me?.name },
            { label: "E-mail", value: me?.email },
          ].map((item, i, arr) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                i < arr.length - 1 && styles.infoRowBorder,
              ]}
            >
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* sair */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const ACCENT = "#C8F04C";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0e0e0e" },
  content: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: "#0e0e0e",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Syne_700Bold",
    fontSize: 22,
    color: "#fff",
    marginBottom: 28,
  },
  profileHeader: { alignItems: "center", marginBottom: 32 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(200,240,76,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "rgba(200,240,76,0.2)",
  },
  avatarText: { fontFamily: "Syne_800ExtraBold", fontSize: 24, color: ACCENT },
  name: {
    fontFamily: "Syne_700Bold",
    fontSize: 20,
    color: "#fff",
    marginBottom: 4,
  },
  email: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: "rgba(200,240,76,0.1)",
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  roleText: { fontFamily: "DM_Sans_400Regular", fontSize: 11, color: ACCENT },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 13,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    overflow: "hidden",
  },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatarSm: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(200,240,76,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSmText: {
    fontFamily: "Syne_800ExtraBold",
    fontSize: 12,
    color: ACCENT,
  },
  cardInfo: { flex: 1 },
  cardName: {
    fontFamily: "Syne_700Bold",
    fontSize: 13,
    color: "#fff",
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
  },
  cardFooter: {
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.05)",
    padding: 12,
  },
  cardFooterText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  infoLabel: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
  },
  infoValue: { fontFamily: "DM_Sans_500Medium", fontSize: 13, color: "#fff" },
  logoutBtn: {
    marginTop: 12,
    padding: 16,
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(248,113,113,0.2)",
    borderRadius: 14,
    alignItems: "center",
  },
  logoutText: { fontFamily: "Syne_700Bold", fontSize: 14, color: "#f87171" },
});
