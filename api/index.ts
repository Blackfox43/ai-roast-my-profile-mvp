import app from "../server";

// Vercel invokes /api/index.ts as the API function, and the URL seen by
// Express can arrive without the leading `/api` prefix. The app routes are
// defined as `/api/health`, `/api/roast`, etc., so this restores the prefix
// before handing the request to Express.
export default function handler(req: any, res: any) {
  if (typeof req.url === "string" && !req.url.startsWith("/api")) {
    req.url = `/api${req.url === "/" ? "" : req.url}`;
  }

  return app(req, res);
}
