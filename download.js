export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed. Use GET." });
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: "Server belum dikonfigurasi: tambahkan GEMINI_API_KEY di Vercel." });

  const raw = typeof req.query?.fileUri === "string" ? req.query.fileUri : "";
  let url;
  try { url = new URL(raw); } catch { return res.status(400).json({ error: "URL video tidak valid." }); }
  if (url.protocol !== "https:" || url.hostname !== "generativelanguage.googleapis.com" ||
      !/^\/v1beta\/files\/[A-Za-z0-9._-]+$/.test(url.pathname)) {
    return res.status(400).json({ error: "Sumber video tidak diizinkan." });
  }
  try {
    const upstream = await fetch(url.toString(), { headers: { "x-goog-api-key": key } });
    if (!upstream.ok) {
      console.error("download upstream", upstream.status);
      return res.status(502).json({ error: "Google belum dapat mengirim file. Coba lagi." });
    }
    const type = upstream.headers.get("content-type") || "video/mp4";
    const buf = Buffer.from(await upstream.arrayBuffer());
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Disposition", 'attachment; filename="bang-motion-video.mp4"');
    res.setHeader("Content-Length", String(buf.length));
    return res.status(200).send(buf);
  } catch (e) {
    console.error("download error", e?.message || e);
    return res.status(502).json({ error: "Gagal mengunduh video dari Google." });
  }
}
