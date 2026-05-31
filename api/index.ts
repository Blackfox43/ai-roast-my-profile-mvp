let cachedApp: any = null;

function normalizeApiUrl(req: any) {
  if (typeof req.url !== "string") return;

  // Vercel may invoke this function with /health, /roast, etc.
  // The Express routes are defined as /api/health, /api/roast, etc.
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }
}

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      const mod = await import("../server");
      cachedApp = mod.default;
    }

    normalizeApiUrl(req);
    return cachedApp(req, res);
  } catch (error: any) {
    console.error("Vercel API function crashed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "API function crashed during startup.",
        message: error?.message || String(error),
      })
    );
  }
}
