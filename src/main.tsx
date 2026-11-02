import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import neueBitUrl from "./styles/fonts/PPNeueBit-Bold.woff2?url";

import { App } from "./app/App";
import "./styles/globals.css";

const neueBitPreload = document.createElement("link");
neueBitPreload.rel = "preload";
neueBitPreload.as = "font";
neueBitPreload.type = "font/woff2";
neueBitPreload.crossOrigin = "anonymous";
neueBitPreload.href = neueBitUrl;
document.head.append(neueBitPreload);

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
