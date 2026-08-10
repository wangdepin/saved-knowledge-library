import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Library from "../app/Library";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <Library />
  </StrictMode>,
);
