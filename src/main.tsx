import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "@fontsource/silkscreen/latin-400.css";
import "@fontsource/silkscreen/latin-700.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-700.css";

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
