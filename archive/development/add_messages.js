const fs = require('fs');

const file = 'frontend/components/ui/animated-ai-chat.tsx';
const content = fs.readFileSync(file, 'utf8');

// Find the line "Ask about archaeological sites..." and add message display after it
const searchText = `                            Ask about archaeological sites, analyze coordinates, or upload imagery
                        </motion.p>
                        </div>`;

const messageDisplayCode = `                            Ask about archaeological sites, analyze coordinates, or upload imagery
                        </motion.p>
                        </div>

                    {/* Messages Display Area */}
                    {messages.length > 0 && (
                        <div className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl mb-4">
                            <div className="p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-3">
                                    {messages.slice(-5).map((message) => (
                                        <div key={message.id} className={\`flex gap-3 \${message.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                                            <div className={\`flex gap-3 max-w-[85%] \${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}\`}>
                                                <div className={\`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium \${message.role === 'user' ? 'bg-white/10 text-white/90' : 'bg-emerald-500/20 text-emerald-400'}\`}>
                                                    {message.role === 'user' ? 'U' : 'AI'}
                                                </div>
                                                <div className={\`rounded-lg p-3 text-sm \${message.role === 'user' ? 'bg-white/[0.08] text-white/90' : 'bg-white/[0.04] text-white/80'}\`}>
                                                    <p className="leading-relaxed">{message.content}</p>
                                                    <div className="flex items-center justify-between mt-2 text-xs">
                                                        <span className="text-white/40">{message.timestamp.toLocaleTimeString()}</span>
                                                        {message.confidence && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-emerald-400">{Math.round(message.confidence * 100)}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(isTyping || externalIsTyping) && (
                                        <div className="flex gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-medium">AI</div>
                                            <div className="bg-white/[0.04] rounded-lg p-3">
                                                <div className="flex items-center gap-2 text-sm text-white/70">
                                                    <span>Analyzing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}`;

const newContent = content.replace(searchText, messageDisplayCode);
fs.writeFileSync(file, newContent);
console.log('Message display added successfully!');
console.log("Adding message display..."); 