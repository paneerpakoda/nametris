import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";

import { App } from "./app/App";
import "./styles/globals.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Nametris could not find its application root.");
}

// Sources:
// https://react.dev/reference/react-dom/client/createRoot
// https://motion.dev/docs/react-motion-config
createRoot(rootElement).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
