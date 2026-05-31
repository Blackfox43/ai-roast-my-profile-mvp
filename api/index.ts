import app from "../server";

function normalizeApiUrl(req: any) {
  if (typeof req.url !== "string") return;

  // Vercel routes /api/* to this single serverless function. Depending on
  // the rewrite, Express may see /health, /roast, etc. while the backend
  // routes are defined as /api/health, /api/roast, etc. Restore the prefix.
  if (!req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }
}

export default function handler(req: any, res: any) {
  try {
    normalizeApiUrl(req);
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel API function crashed:", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "API function crashed.",
        message: error?.message || String(error),
      })
    );
  }
}
