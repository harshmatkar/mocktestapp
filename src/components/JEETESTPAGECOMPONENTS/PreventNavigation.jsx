import { useEffect } from "react";

const PreventNavigation = () => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave this page?";
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const handleBackButton = () => {
      const confirmLeave = window.confirm("Are you sure you want to leave this page?");
      if (!confirmLeave) {
        // Re-push the state to override the back action
        window.history.pushState(null, "", window.location.href);
      } else {
        // Allow normal back navigation
        window.removeEventListener("popstate", handleBackButton);
        history.back();
      }
    };

    // Push a dummy state initially
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      handleBackButton();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("You are leaving the test page!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
};

export default PreventNavigation;
