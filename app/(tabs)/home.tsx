import { exerciseLabels } from "@/src/data/exerciseLabels";
import { useFocusEffect, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api, setAuthToken } from "../../src/lib/api";

interface Personal {
  id: string;
  name: string;
  email: string;
}

interface ApprovedLink {
  id: string;
  personal: Personal;
}

interface Exercise {
  id: string;
  name: string;
}

interface Workout {
  id: string;
  title: string;
  description?: string;
  exercises?: Exercise[];
}

interface Me {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [approvedLink, setApprovedLink] = useState<ApprovedLink | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadToken();
    }, []),
  );

  async function loadToken() {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      router.replace("/(auth)/login");
      return;
    }
    setAuthToken(token);
    fetchData();
  }

  async function fetchData() {
    try {
      const [meRes, linkRes, workoutsRes] = await Promise.all([
        api.get("/users/me"),
        api.get("/links/approved"),
        api.get("/workouts"),
      ]);

      setMe(meRes.data);
      setApprovedLink(linkRes.data);

      const workoutsWithEx = await Promise.all(
        workoutsRes.data.map(async (w: Workout) => {
          try {
            const { data } = await api.get(`/workouts/${w.id}/exercises`);
            return { ...w, exercises: data };
          } catch {
            return { ...w, exercises: [] };
          }
        }),
      );
      setWorkouts(workoutsWithEx);
    } catch {
      router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
  }

  const today = new Date()
    .toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    .replace(/\b\w/g, (c) => c.toLowerCase());

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* saudação */}
      <Text style={styles.greeting}>
        Olá, <Text style={styles.accentText}>{me?.name?.split(" ")[0]}</Text> 👋
      </Text>
      <Text style={styles.date}>{today}</Text>

      {/* personal vinculado ou não */}
      {approvedLink ? (
        <View style={styles.personalCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(approvedLink.personal.name)}
            </Text>
          </View>
          <View>
            <Text style={styles.personalName}>
              {approvedLink.personal.name}
            </Text>
            <Text style={styles.personalLabel}>Seu personal trainer</Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            Você não tem um personal vinculado
          </Text>
          <TouchableOpacity
            style={styles.btnSm}
            onPress={() => router.push("/(tabs)/search")}
          >
            <Text style={styles.btnSmText}>Buscar personal</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* treinos */}
      <Text style={styles.sectionTitle}>
        {approvedLink ? "Seus treinos" : "Meus treinos"}
      </Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum treino ainda</Text>
          {!approvedLink && (
            <TouchableOpacity style={styles.btnSm}>
              <Text style={styles.btnSmText}>+ Criar treino</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => router.push("/(tabs)/workouts")}
            activeOpacity={0.8}
          >
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            {workout.description && (
              <Text style={styles.workoutDesc}>{workout.description}</Text>
            )}
            {workout.exercises && workout.exercises.length > 0 && (
              <View style={styles.exRow}>
                {workout.exercises.slice(0, 2).map((ex) => (
                  <View key={ex.id} style={styles.exPill}>
                    <Text style={styles.exPillText}>
                      {exerciseLabels[ex.name] || ex.name}
                    </Text>
                  </View>
                ))}
                {workout.exercises.length > 2 && (
                  <View style={styles.exPill}>
                    <Text style={styles.exPillText}>
                      +{workout.exercises.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))
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
  greeting: {
    fontFamily: "Syne_700Bold",
    fontSize: 28,
    color: "#fff",
    marginBottom: 4,
  },
  accentText: { color: ACCENT },
  date: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 18,
    color: "rgba(255,255,255,0.25)",
    marginBottom: 20,
    textTransform: "capitalize",
  },
  personalCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(200,240,76,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(200,240,76,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: "Syne_800ExtraBold", fontSize: 12, color: ACCENT },
  personalName: { fontFamily: "Syne_700Bold", fontSize: 13, color: "#fff" },
  personalLabel: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.25)",
  },
  emptyCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.08)",
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.2)",
    marginBottom: 10,
  },
  btnSm: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  btnSmText: { fontFamily: "Syne_700Bold", fontSize: 11, color: "#0e0e0e" },
  sectionTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 18,
    color: "#fff",
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  workoutTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 16,
    color: "#fff",
    marginBottom: 3,
  },
  workoutDesc: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },
  exRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  exPill: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  exPillText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
  },
});
