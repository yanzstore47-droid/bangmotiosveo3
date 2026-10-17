import { GoogleGenAI } from "@google/genai";

const MODELS = new Set([
  "veo-3.1-lite-generate-preview",
  "veo-3.1-fast-generate-preview",
  "veo-3.1-generate-preview"
]);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server belum dikonfigurasi: tambahkan GEMINI_API_KEY di Vercel." });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const model = MODELS.has(body.model) ? body.model : "veo-3.1-lite-generate-preview";
    const aspectRatio = body.aspectRatio === "16:9" ? "16:9" : "9:16";

    if (!prompt) return res.status(400).json({ error: "Prompt wajib diisi." });
    if (prompt.length > 2500) return res.status(400).json({ error: "Prompt maksimal 2500 karakter." });

    const ai = new GoogleGenAI({ apiKey: key });
    const operation = await ai.models.generateVideos({
      model,
      prompt,
      config: { aspectRatio, resolution: "720p", numberOfVideos: 1 }
    });
    if (!operation?.name) return res.status(502).json({ error: "API Google tidak mengembalikan ID operasi." });
    return res.status(202).json({ operationName: operation.name });
  } catch (e) {
    console.error("generate error", e?.status || "", e?.message || e);
    const status = Number(e?.status);
    const safe = status === 400 ? "Permintaan ditolak Google. Periksa prompt dan parameter model." :
      status === 401 || status === 403 ? "API key, akses model, atau billing Google belum benar." :
      status === 429 ? "Kuota atau batas penggunaan API tercapai. Coba lagi nanti." :
      "Gagal memulai video. Periksa akses model Veo, billing, dan Function Logs Vercel.";
    return res.status(502).json({ error: safe });
  }
}
