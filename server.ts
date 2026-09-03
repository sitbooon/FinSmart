import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import app from "./src/server/app";

const PORT = 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // When running in container / local dev, bind to port 3000
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`FinOS Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
