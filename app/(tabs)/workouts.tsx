import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { exerciseLabels } from "../../src/data/exerciseLabels";
import { getExerciseByName } from "../../src/exerciseApi";
import { api } from "../../src/lib/api";

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  finalWeight?: number;
}

interface Workout {
  id: string;
  title: string;
  description?: string;
  exercises?: Exercise[];
}

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [exerciseImages, setExerciseImages] = useState<Record<string, string>>(
    {},
  );
  const [exerciseDetails, setExerciseDetails] = useState<
    Record<string, string[]>
  >({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {},
  );

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, []),
  );

  async function fetchWorkouts() {
    setLoading(true);
    try {
      const { data } = await api.get("/workouts");
      const withExercises = await Promise.all(
        data.map(async (w: Workout) => {
          try {
            const { data: ex } = await api.get(`/workouts/${w.id}/exercises`);
            return { ...w, exercises: ex };
          } catch {
            return { ...w, exercises: [] };
          }
        }),
      );
      setWorkouts(withExercises);
    } finally {
      setLoading(false);
    }
  }

  async function handleExpandExercise(
    exerciseId: string,
    exerciseName: string,
  ) {
    if (expandedExercise === exerciseId) {
      setExpandedExercise(null);
      return;
    }

    setExpandedExercise(exerciseId);

    if (!exerciseImages[exerciseId]) {
      setLoadingImages((prev) => ({ ...prev, [exerciseId]: true }));
      const result = await getExerciseByName(exerciseName);
      if (result?.gifUrl) {
        setExerciseImages((prev) => ({ ...prev, [exerciseId]: result.gifUrl }));
      }
      if (result?.instructions) {
        setExerciseDetails((prev) => ({
          ...prev,
          [exerciseId]: result.instructions,
        }));
      }
      setLoadingImages((prev) => ({ ...prev, [exerciseId]: false }));
    }
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
      <Text style={styles.title}>Meus treinos</Text>
      <Text style={styles.subtitle}>
        Toque em um treino para ver os exercícios
      </Text>

      {workouts.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum treino encontrado.</Text>
        </View>
      ) : (
        workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            style={styles.workoutCard}
            onPress={() => {
              setExpandedId(expandedId === workout.id ? null : workout.id);
              setExpandedExercise(null);
            }}
            activeOpacity={0.8}
          >
            {/* header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                {workout.description && (
                  <Text style={styles.workoutDesc}>{workout.description}</Text>
                )}
              </View>
              <View style={styles.cardHeaderRight}>
                <Text style={styles.exCount}>
                  {workout.exercises?.length || 0} ex.
                </Text>
                <Text style={styles.chevron}>
                  {expandedId === workout.id ? "▲" : "▼"}
                </Text>
              </View>
            </View>

            {/* exercícios */}
            {expandedId === workout.id && (
              <View style={styles.exerciseList}>
                <View style={styles.divider} />
                {workout.exercises?.length === 0 ? (
                  <Text style={styles.emptyText}>Nenhum exercício ainda.</Text>
                ) : (
                  workout.exercises?.map((ex) => (
                    <View key={ex.id} style={styles.exerciseItem}>
                      {/* info principal */}
                      <View style={styles.exerciseRow}>
                        <Text style={styles.exerciseName}>
                          {exerciseLabels[ex.name] || ex.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleExpandExercise(ex.id, ex.name)}
                          style={styles.detailBtn}
                        >
                          <Text style={styles.detailBtnText}>
                            {expandedExercise === ex.id
                              ? "Fechar"
                              : "Ver detalhes"}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.exerciseStats}>
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{ex.sets}</Text>
                          <Text style={styles.statLabel}>séries</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.stat}>
                          <Text style={styles.statValue}>{ex.reps}</Text>
                          <Text style={styles.statLabel}>reps</Text>
                        </View>
                        {ex.weight && (
                          <>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                              <Text style={styles.statValue}>
                                {ex.weight}kg
                              </Text>
                              <Text style={styles.statLabel}>carga</Text>
                            </View>
                          </>
                        )}
                        {ex.finalWeight && (
                          <>
                            <View style={styles.statDivider} />
                            <View style={styles.stat}>
                              <Text
                                style={[styles.statValue, { color: "#C8F04C" }]}
                              >
                                {ex.finalWeight}kg
                              </Text>
                              <Text style={styles.statLabel}>executado</Text>
                            </View>
                          </>
                        )}
                      </View>

                      {/* detalhes expandidos */}
                      {expandedExercise === ex.id && (
                        <View style={styles.exerciseDetails}>
                          {loadingImages[ex.id] ? (
                            <View style={styles.imagePlaceholder}>
                              <ActivityIndicator color="#C8F04C" size="small" />
                            </View>
                          ) : exerciseImages[ex.id] ? (
                            <Image
                              source={{ uri: exerciseImages[ex.id] }}
                              style={styles.exerciseImage}
                              resizeMode="contain"
                            />
                          ) : (
                            <View style={styles.imagePlaceholder}>
                              <Text style={styles.emptyText}>
                                Imagem não disponível
                              </Text>
                            </View>
                          )}

                          {/* instruções */}
                          {exerciseDetails[ex.id] &&
                            exerciseDetails[ex.id].length > 0 && (
                              <View style={styles.instructionsBox}>
                                <Text style={styles.instructionsTitle}>
                                  Como executar
                                </Text>
                                {exerciseDetails[ex.id].map((step, index) => (
                                  <View
                                    key={index}
                                    style={styles.instructionRow}
                                  >
                                    <Text style={styles.instructionNumber}>
                                      {index + 1}
                                    </Text>
                                    <Text style={styles.instructionText}>
                                      {step}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                        </View>
                      )}
                    </View>
                  ))
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
  emptyCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
  },
  workoutCard: {
    backgroundColor: "#151515",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: { flex: 1 },
  cardHeaderRight: { alignItems: "flex-end", gap: 4 },
  workoutTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 14,
    color: "#fff",
    marginBottom: 2,
  },
  workoutDesc: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
  },
  exCount: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: "rgba(255,255,255,0.25)",
  },
  chevron: { fontSize: 10, color: "rgba(255,255,255,0.2)" },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 12,
  },
  exerciseList: {},
  exerciseItem: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  exerciseName: {
    fontFamily: "DM_Sans_500Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    flex: 1,
  },
  detailBtn: {
    backgroundColor: "rgba(200,240,76,0.1)",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  detailBtnText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 11,
    color: ACCENT,
  },
  exerciseStats: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { alignItems: "center" },
  statValue: { fontFamily: "Syne_700Bold", fontSize: 14, color: "#fff" },
  statLabel: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 10,
    color: "rgba(255,255,255,0.25)",
    marginTop: 1,
  },
  statDivider: {
    width: 0.5,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  exerciseDetails: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  exerciseImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
  },
  instructionsBox: {
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  instructionsTitle: {
    fontFamily: "Syne_700Bold",
    fontSize: 12,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  instructionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  instructionNumber: {
    fontFamily: "Syne_700Bold",
    fontSize: 12,
    color: ACCENT,
    width: 16,
    flexShrink: 0,
  },
  instructionText: {
    fontFamily: "DM_Sans_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    flex: 1,
    lineHeight: 18,
  },
});
