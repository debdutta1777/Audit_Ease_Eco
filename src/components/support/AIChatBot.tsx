import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIChatBotProps {
    onBack: () => void;
    onClose: () => void;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}



export function AIChatBot({ onBack, onClose }: AIChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hi there! 👋 I'm your AuditEase AI assistant. I'm here to help answer questions about our platform, pricing, features, and more. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping) return;

        const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const history = messages.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');

            const prompt = `You are the AI Customer Support Agent for "AuditEase", a premium compliance audit platform.
            
CONTEXT:
AuditEase helps companies automate compliance audits (SOC 2, GDPR, HIPAA, etc.) using AI.
- Free Plan: 10 audits/month
- Pro Plan: $49/month (unlimited)
- Enterprise: Custom pricing
- Users create audits by uploading PDFs and selecting standards.
- We use bank-grade AES-256 encryption.

INSTRUCTIONS:
- Answer the user's question helpfully and concisely.
- Use a friendly, professional tone.
- If you don't know something, ask them to contact support@auditease.ai.
- Prioritize promoting the Pro Plan if asked about limits.

CHAT HISTORY:
${history}

USER QUESTION:
${inputValue}

Your Response:`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.3,
                            maxOutputTokens: 1024
                        }
                    })
                }
            );

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('API Key Error: Domain not allowed. Please check your Google AI Studio key restrictions.');
                }
                throw new Error('API request failed');
            }

            const result = await response.json();
            const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to support right now. Please email support@auditease.ai";

            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: aiText,
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiResponse]);

        } catch (error) {
            console.error('Chat Error:', error);
            const errorResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm sorry, I encountered a connection error. Please try again later or contact support@auditease.ai",
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorResponse]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-sm">AI Assistant</h3>
                        <p className="text-xs text-muted-foreground">Always here to help</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={cn(
                            "flex gap-2 animate-fade-in",
                            message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        )}
                    >
                        <div
                            className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0",
                                message.sender === 'user'
                                    ? 'bg-blue-600'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                            )}
                        >
                            {message.sender === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                            ) : (
                                <Bot className="h-4 w-4 text-white" />
                            )}
                        </div>
                        <div
                            className={cn(
                                "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                                message.sender === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-card border border-border text-foreground'
                            )}
                        >

                            {/* Use helper to render bold text and newlines */}
                            {message.sender === 'user' ? (
                                message.text
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    {message.text.split('\n').map((line, i) => (
                                        <p key={i} className={`min-h-[1.2em] ${i < message.text.split('\n').length - 1 ? 'mb-1' : ''}`}>
                                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                                                if (part.startsWith('**') && part.endsWith('**')) {
                                                    return <strong key={j} className="font-bold text-primary">{part.slice(2, -2)}</strong>;
                                                }
                                                return <span key={j}>{part}</span>;
                                            })}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex gap-2 animate-fade-in">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-card border border-border rounded-2xl px-4 py-3">
                            <div className="flex gap-1">
                                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        size="icon"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
