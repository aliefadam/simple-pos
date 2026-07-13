import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { seedDatabaseIfNeeded } from "./dummy-data/seed";

async function bootstrap() {
  await seedDatabaseIfNeeded();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

bootstrap();
