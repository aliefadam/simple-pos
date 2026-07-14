import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { seedDatabaseIfNeeded } from "./dummy-data/seed";

function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
  });
}

async function bootstrap() {
  try {
    await seedDatabaseIfNeeded();
  } catch (error) {
    console.warn("Initial seed skipped:", error);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  registerServiceWorker();
}

bootstrap();
