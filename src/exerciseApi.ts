import axios from "axios";

const BASE_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";
const JSON_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const exerciseIdMap: Record<string, string> = {
  // Peito
  "barbell bench press": "Barbell_Bench_Press",
  "dumbbell bench press": "Dumbbell_Bench_Press",
  "incline dumbbell fly": "Incline_Dumbbell_Flyes",
  "dumbbell fly": "Dumbbell_Flyes",
  "cable crossover": "Cable_Crossover",
  "push up": "Push-Up",
  "dumbbell pullover": "Dumbbell_Pullover",
  "pec deck fly": "Pec_Deck_Fly",
  "archer push up": "Archer_Push_Up",
  // Costas
  "lat pulldown": "Wide-Grip_Lat_Pulldown",
  "pull up": "Pull-Up",
  "barbell bent over row": "Bent_Over_Barbell_Row",
  "dumbbell one arm row": "One-Arm_Dumbbell_Row",
  "seated cable row": "Seated_Cable_Rows",
  deadlift: "Barbell_Deadlift",
  "barbell shrug": "Barbell_Shrug",
  // Ombro
  "barbell overhead press": "Barbell_Shoulder_Press",
  "dumbbell shoulder press": "Dumbbell_Shoulder_Press",
  "arnold press": "Arnold_Dumbbell_Press",
  "dumbbell lateral raise": "Side_Lateral_Raise",
  "dumbbell front raise": "Dumbbell_Front_Raise",
  "barbell upright row": "Barbell_Upright_Row",
  "barbell front raise": "Barbell_Front_Raise",
  // Bíceps
  "barbell curl": "Barbell_Curl",
  "dumbbell alternate bicep curl": "Alternate_Hammer_Curl",
  "hammer curl": "Hammer_Curls",
  "concentration curl": "Concentration_Curl",
  "ez barbell preacher curl": "EZ-Bar_Preacher_Curl",
  "cable curl": "Cable_Hammer_Curls_-_Rope_Attachment",
  // Tríceps
  "cable triceps pushdown": "Triceps_Pushdown",
  "barbell skull crusher": "Lying_Triceps_Press",
  "dumbbell tricep extension": "Dumbbell_Tricep_Extension",
  "triceps pushdown": "Triceps_Pushdown",
  "triceps dip": "Triceps_Dip",
  "dumbbell kickback": "Dumbbell_Tricep_Kickback",
  "barbell close-grip bench press": "Close-Grip_Barbell_Bench_Press",
  // Pernas
  "barbell squat": "Barbell_Full_Squat",
  "hack squat": "Barbell_Hack_Squat",
  "sumo squat": "Sumo_Squat",
  "leg press": "Leg_Press",
  "leg extension": "Leg_Extensions",
  "leg curl": "Seated_Leg_Curl",
  "romanian deadlift": "Romanian_Deadlift",
  lunge: "Barbell_Lunge",
  "dumbbell lunge": "Dumbbell_Lunges",
  "bulgarian split squat": "Bulgarian_Split_Squat",
  // Panturrilha
  "standing calf raise": "Standing_Calf_Raises",
  "seated calf raise": "Seated_Calf_Raise",
  // Abdômen
  crunch: "Crunch",
  "3/4 sit-up": "3_4_Sit-Up",
  "reverse crunch": "Reverse_Crunch",
  plank: "Plank",
  "leg raise": "Hanging_Leg_Raise",
  "russian twist": "Russian_Twist",
  "cable crunch": "Cable_Crunch",
  "air bike": "Air_Bike",
  "alternate heel touchers": "Alternate_Heel_Touchers",
  // Glúteo
  "hip thrust": "Barbell_Hip_Thrust",
  "donkey kick": "Donkey_Kick",
  "step up": "Dumbbell_Step_Ups",
};

let exercisesCache: any[] | null = null;

async function getExercisesData() {
  if (exercisesCache) return exercisesCache;
  const { data } = await axios.get(JSON_URL);
  exercisesCache = data;
  return data;
}

async function translateToPortuguese(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(text)}`;
    const { data } = await axios.get(url);
    return data[0].map((item: any) => item[0]).join("");
  } catch {
    return text;
  }
}

export async function getExerciseByName(name: string): Promise<{
  gifUrl: string;
  instructions: string[];
} | null> {
  try {
    const exerciseId = exerciseIdMap[name.toLowerCase()];
    if (!exerciseId) return null;

    const gifUrl = `${BASE_URL}/${exerciseId}/0.jpg`;

    const exercises = await getExercisesData();
    const exercise = exercises.find((e: any) => e.id === exerciseId);
    const rawInstructions: string[] = exercise?.instructions || [];

    // traduz todas as instruções em paralelo
    const instructions = await Promise.all(
      rawInstructions.map((step) => translateToPortuguese(step)),
    );

    return { gifUrl, instructions };
  } catch {
    return null;
  }
}
