"use client";

import { useEffect, useState } from "react";
import { appStore } from "@/lib/stores/app-store";

interface OptimizedPageWrapperProps {
  children: React.ReactNode;
  loadData?: boolean;
}

export default function OptimizedPageWrapper({ 
  children, 
  loadData = true 
}: OptimizedPageWrapperProps) {
  const [appState, setAppState] = useState(appStore.getState());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subscribe to app store changes
    const unsubscribe = appStore.subscribe(() => {
      setAppState(appStore.getState());
    });

    // Load data if needed and not fresh
    if (loadData && !appStore.isDataFresh()) {
      setIsLoading(true);
      appStore.fetchSystemStats().finally(() => {
        setIsLoading(false);
      });
    }

    return unsubscribe;
  }, [loadData]);

  // Provide app state to children via context or props
  return (
    <div className="optimized-page-wrapper">
      {children}
    </div>
  );
}

// Custom hook to use app store data
export function useAppStore() {
  const [appState, setAppState] = useState(appStore.getState());

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setAppState(appStore.getState());
    });
    return unsubscribe;
  }, []);

  return {
    ...appState,
    refreshData: () => appStore.clearCache(),
    isDataFresh: appStore.isDataFresh(),
  };
} 