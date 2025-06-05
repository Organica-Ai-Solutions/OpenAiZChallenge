"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Search, 
  Calendar, 
  Download, 
  Upload, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  Clock,
  MessageSquare,
  X,
  Archive,
  Star,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface ChatSession {
  id: string;
  timestamp: Date;
  messageCount: number;
  lastMessage: string;
  starred?: boolean;
  archived?: boolean;
  title?: string;
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onSessionStar: (sessionId: string) => void;
  onSessionArchive: (sessionId: string) => void;
  onExportHistory: () => void;
  onImportHistory: (data: string) => void;
  currentSessionId?: string;
}

export function ChatHistory({
  sessions,
  onSessionSelect,
  onSessionDelete,
  onSessionStar,
  onSessionArchive,
  onExportHistory,
  onImportHistory,
  currentSessionId
}: ChatHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'starred' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'messages'>('date');

  const filteredSessions = sessions
    .filter(session => {
      const matchesSearch = session.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.lastMessage.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'starred' && session.starred) ||
                           (filterType === 'archived' && session.archived);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return b.messageCount - a.messageCount;
    });

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (sessionDate.getTime() === today.getTime()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (sessionDate.getTime() === today.getTime() - 86400000) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportHistory(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <History className="h-4 w-4" />
        <span className="text-sm">Chat History</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="absolute top-12 left-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Chat Sessions</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search sessions..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-800"
                  >
                    <option value="all">All</option>
                    <option value="starred">Starred</option>
                    <option value="archived">Archived</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs dark:bg-gray-800"
                  >
                    <option value="date">Date</option>
                    <option value="messages">Messages</option>
                  </select>
                </div>

                {/* Export/Import */}
                <div className="flex space-x-1">
                  <button
                    onClick={onExportHistory}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Export History"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <label className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer" title="Import History">
                    <Upload className="h-4 w-4" />
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredSessions.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  {searchTerm ? 'No matching sessions found' : 'No chat sessions yet'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                        session.id === currentSessionId && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => onSessionSelect(session.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <MessageSquare className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">
                              {session.title || `Session ${session.id.slice(-8)}`}
                            </span>
                            {session.starred && <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />}
                            {session.archived && <Archive className="h-3 w-3 text-gray-400 flex-shrink-0" />}
                          </div>
                          
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                            {session.lastMessage}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(session.timestamp)}</span>
                            </div>
                            <span>{session.messageCount} messages</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSessionStar(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-yellow-500"
                          >
                            <Star className={cn("h-3 w-3", session.starred && "text-yellow-500 fill-current")} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSessionArchive(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Archive className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSessionDelete(session.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 