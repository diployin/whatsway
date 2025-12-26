import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
}


createRoot(document.getElementById("root")!).render(<App />);
