import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "./stijl.css";

const wortel = document.getElementById("wortel");
if (!wortel) throw new Error("De aanhechting #wortel ontbreekt in index.html");

createRoot(wortel).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
