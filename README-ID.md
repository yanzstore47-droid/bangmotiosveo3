# Bang Motion Studio — Paket lengkap backend + Veo

## File
- `index.html`: antarmuka Bang Motion Studio dengan panel Generate Video AI.
- `api/generate.js`: memulai proses generasi video melalui Google Gemini API SDK.
- `api/status.js`: memeriksa status operasi Veo.
- `api/download.js`: mengunduh video melalui backend dengan validasi host/path.
- `package.json`: SDK resmi `@google/genai`.
- `vercel.json`: pengaturan durasi fungsi.

## Deployment
1. Ekstrak ZIP ke komputer.
2. Upload ISI folder ini ke root repository GitHub. Jangan upload ZIP sebagai satu file.
3. Di Vercel, import repository atau deploy ulang proyek yang terhubung.
4. Di Google AI Studio buat API key: https://aistudio.google.com/
5. Pastikan project Google memiliki akses model Veo dan billing yang dibutuhkan. Generasi video Veo melalui Gemini API tidak dijamin gratis.
6. Vercel Project → Settings → Environment Variables:
   - Name: `GEMINI_API_KEY`
   - Value: API key Google
   - Environment: Production (Preview bila diperlukan)
7. Save dan redeploy.
8. Buka website → panel Generate Video AI → masukkan prompt → pilih rasio/model → Generate.

## Penting
Tidak ada kode yang bisa menjamin bebas error di semua akun karena akses model, nama model, billing, kuota, dan respons API bergantung pada Google. Paket ini menampilkan pesan error yang lebih jelas jika konfigurasi tidak tersedia. Pastikan selalu cocokkan nama model yang tersedia pada dokumentasi Google terbaru.

Backend belum dilengkapi autentikasi, rate limiting persisten, atau kuota per pengguna. Jangan membiarkan endpoint publik tanpa pembatasan karena pengguna lain dapat memicu tagihan API. Sebelum dibuka umum, tambahkan login, pembatasan penggunaan, dan proteksi biaya.

Dokumentasi:
- https://ai.google.dev/gemini-api/docs/veo
- https://ai.google.dev/gemini-api/docs/pricing
- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/functions
