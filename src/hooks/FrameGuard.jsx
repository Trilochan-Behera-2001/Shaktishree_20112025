
import  { useEffect, useState } from "react";

export default function FrameGuard({ children, message, allowIfSameOrigin = true }) {
  const [blockedInFrame, setBlockedInFrame] = useState(false);

  useEffect(() => {
    if (window.top === window.self) return;

    if (allowIfSameOrigin) {
      try {
        window.top.location = window.self.location;
        return;
      } catch  {
        // Different origin, cannot set top.location
      }
    }

    // Cross-origin framing: we cannot change top.location due to browser security.
    // Show overlay to prevent interaction with the app.
    setBlockedInFrame(true);
  }, [allowIfSameOrigin]);

  if (blockedInFrame) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 2147483647,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.85)", color: "white", padding: 20, textAlign: "center"
      }}>
        <div style={{ maxWidth: 700 }}>
          <h2>Security: page cannot be displayed</h2>
          <p>{message || "This page is blocked because it is embedded in another site. Open it directly instead."}</p>
          <p>If you reached this message unexpectedly, please open the website in a new tab.</p>
          <button onClick={() => window.open(window.location.href, "_blank")} style={{
            marginTop: 12, padding: "8px 14px", borderRadius: 6, cursor: "pointer"
          }}>
            Open in new tab
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
