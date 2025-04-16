import { useEffect, useState } from "react";

const PreventNavigation = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const preventGoBack = () => {
      console.log("🔄 Pushing new history state to prevent back navigation.");
      window.history.pushState(null, "", window.location.href);
    };

    const handleBackButton = () => {
      console.log("⬅️ Back button pressed!");
      setShowOverlay(true);
      console.log("🚨 Overlay activated!");

      setTimeout(() => {
        setShowOverlay(false);
        console.log("✅ Overlay removed, restoring state...");
        preventGoBack();
      }, 100);
    };

    preventGoBack(); // Push initial state
    window.addEventListener("popstate", handleBackButton);
    console.log("✅ Back button listener added!");

    return () => {
      console.log("❌ Removing back button listener...");
      window.removeEventListener("popstate", handleBackButton);
    };
  }, []);

  return showOverlay ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontSize: "20px",
      }}
    >
      <p>⚠️ Back navigation is disabled!</p>
    </div>
  ) : null;
};

export default PreventNavigation;
