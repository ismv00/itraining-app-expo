import axios from "axios";
import { Buffer } from "buffer";

const exerciseApi = axios.create({
  baseURL: "https://exercisedb.p.rapidapi.com",
  headers: {
    "x-rapidapi-key": "6992c40404msh8e630fe8228fc81p10ee75jsn4cc8656a5653",
    "x-rapidapi-host": "exercisedb.p.rapidapi.com",
  },
});

export async function getExerciseByName(name: string) {
  try {
    console.log("Buscando exercício:", name);
    const { data } = await exerciseApi.get(
      `/exercises/name/${encodeURIComponent(name.toLowerCase())}`,
      { params: { limit: 1 } },
    );

    if (!data[0]) return null;

    const exerciseId = data[0].id;

    // busca a imagem como arraybuffer
    const imageRes = await exerciseApi.get("/image", {
      params: { exerciseId, resolution: 180 },
      responseType: "arraybuffer",
    });

    const base64 = Buffer.from(imageRes.data, "binary").toString("base64");
    const gifUrl = `data:image/gif;base64,${base64}`;

    return { ...data[0], gifUrl };
  } catch (err) {
    console.log("Erro:", err);
    return null;
  }
}
