
import { useEffect } from "react";
import App from "./App.jsx";

export default function Root() {
  useEffect(() => {
    if (window.top !== window.self) {
      try {
        window.top.location = window.self.location;
      } catch {
        document.body.innerHTML = "Blocked: cannot be displayed in a frame.";
      }
    }
  }, []);

  return <App />;
}
