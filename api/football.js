export default async function handler(req, res) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return res.status(500).json({ message: "API_FOOTBALL_KEY Vercel'de tanımlı değil." });

  const allowed = new Set([
    "fixtures",
    "teams",
    "teams/statistics",
    "predictions",
    "odds",
    "headtohead",
    "injuries"
  ]);

  const endpoint = req.query.endpoint;
  if (!allowed.has(endpoint)) return res.status(400).json({ message: "Geçersiz endpoint." });

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (k !== "endpoint" && typeof v === "string" && v) params.set(k, v);
  }

  const url = `https://v3.football.api-sports.io/${endpoint}?${params.toString()}`;
  try {
    const r = await fetch(url, {
      headers: {
        "x-apisports-key": key,
        "Accept": "application/json"
      }
    });
    const text = await r.text();
    res.status(r.status);
    res.setHeader("Cache-Control", endpoint === "fixtures" ? "s-maxage=30, stale-while-revalidate=60" : "s-maxage=60, stale-while-revalidate=120");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    return res.send(text);
  } catch (e) {
    return res.status(502).json({ message: "API bağlantısı kurulamadı.", detail: String(e.message || e) });
  }
}
