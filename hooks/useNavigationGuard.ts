import { Href, useRouter } from "expo-router";
import { useState } from "react";

interface UseNavigationGuardOptions {
  delay?: number; // Delay in milliseconds before re-enabling navigation
  onNavigationStart?: () => void; // Callback when navigation starts
  onNavigationComplete?: () => void; // Callback when navigation completes
}

export const useNavigationGuard = (options: UseNavigationGuardOptions = {}) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const {
    delay = 500,
    onNavigationStart,
    onNavigationComplete
  } = options;

  const navigate = (path: Href) => {
    if (isNavigating) {
      return;
    }

    // Start navigation
    setIsNavigating(true);
    onNavigationStart?.();
    
    // Navigate to the path
    router.push(path);
    
    // Reset navigation state after delay
    setTimeout(() => {
      setIsNavigating(false);
      onNavigationComplete?.();
    }, delay);
  };

  return {
    navigate,
    isNavigating,
    goBack: () => {
      if (!isNavigating) {
        router.back();
      }
    },
    canNavigate: !isNavigating
  };
};
