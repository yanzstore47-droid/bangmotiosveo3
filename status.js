import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server belum dikonfigurasi: tambahkan GEMINI_API_KEY di Vercel." });
  const name = typeof req.query?.name === "string" ? req.query.name : "";
  if (!/^(models\/veo-[A-Za-z0-9._-]+\/operations\/[A-Za-z0-9._-]+|operations\/[A-Za-z0-9._-]+)$/.test(name)) {
    return res.status(400).json({ error: "Nama operasi tidak valid." });
  }
  try {
    const ai = new GoogleGenAI({ apiKey: key });
    const op = await ai.operations.getVideosOperation({ operation: { name } });
    if (!op.done) return res.status(200).json({ state: "processing" });
    if (op.error) return res.status(200).json({ state: "failed", error: "Google gagal membuat video. Periksa billing, kuota, dan prompt." });
    const item = op.response?.generatedVideos?.[0] || op.response?.generated_videos?.[0];
    const uri = item?.video?.uri;
    if (!uri) return res.status(200).json({ state: "failed", error: "Video selesai tetapi URI file tidak ditemukan." });
    return res.status(200).json({ state: "done", fileUri: uri });
  } catch (e) {
    console.error("status error", e?.status || "", e?.message || e);
    return res.status(502).json({ error: "Tidak dapat memeriksa status video. Coba lagi atau lihat Function Logs Vercel." });
  }
}
