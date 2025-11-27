import { useNavigate, useRouter } from "@tanstack/react-router";
import { useCallback } from "react";

export const useNavigation = () => {
  const navigate = useNavigate();
  const router = useRouter();

  const goBack = useCallback(() => {
    // Try to go back in history, fallback to home if no history
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const goForward = useCallback(() => {
    window.history.forward();
  }, []);

  const navigateTo = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      navigate({
        to,
        replace: options?.replace || false,
      });
    },
    [navigate]
  );

  return {
    goBack,
    goForward,
    navigateTo,
    canGoBack: window.history.length > 1,
    router,
  };
};
