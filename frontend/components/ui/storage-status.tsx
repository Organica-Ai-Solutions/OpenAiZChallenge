/**
 * Storage Status Component
 * Shows storage system status across the app
 */

import React from 'react';
import { useStorageService } from '@/lib/services/universal-storage-service';

interface StorageStatusProps {
  showStats?: boolean;
  compact?: boolean;
}

export function StorageStatus({ showStats = false, compact = false }: StorageStatusProps) {
  const { online, stats } = useStorageService();
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={online ? 'text-green-600' : 'text-red-600'}>
          {online ? '💾 Storage' : '📂 Storage Offline'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-3 h-3 rounded-full ${online ? 'bg-green-500' : 'bg-red-500'}`} />
        <h3 className="font-semibold text-gray-900">
          Storage System {online ? 'Online' : 'Offline'}
        </h3>
      </div>
      
      {online && stats && showStats && (
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Total Analyses:</span>
            <span className="font-medium">{stats.total_analyses || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>High Confidence:</span>
            <span className="font-medium">{stats.high_confidence_count || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Divine Analyses:</span>
            <span className="font-medium">{stats.divine_analyses || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Vision Analyses:</span>
            <span className="font-medium">{stats.vision_analyses || 0}</span>
          </div>
        </div>
      )}
      
      {!online && (
        <p className="text-red-600 text-sm">
          Storage backend is offline. Analysis results will not be saved.
        </p>
      )}
    </div>
  );
}

export default StorageStatus;