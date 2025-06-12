"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2, Activity } from "lucide-react";

interface PageLoaderProps {
  children: React.ReactNode;
}

export default function PageLoader({ children }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsLoading(true);
    
    // Quick loading simulation to smooth transitions  
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 150); // Very short delay

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Activity className="h-8 w-8 text-blue-400 animate-pulse" />
            <Loader2 className="h-12 w-12 text-emerald-400 animate-spin absolute -top-2 -left-2" />
          </div>
          <div className="text-slate-400 text-sm">Loading NIS Protocol...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
    </div>
  );
} 