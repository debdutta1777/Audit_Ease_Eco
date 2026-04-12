import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    documentId: string;
    documentName: string;
    extractedText: string;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatInterface({ documentId, documentName, extractedText, messages, setMessages }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!geminiApiKey) throw new Error('API Key missing');

            // Construct the prompt with context and history
            const historyText = messages.slice(1).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

            const prompt = `
Context:
One of the user's documents named "${documentName}" contains the following text:
"""
${extractedText.substring(0, 20000)} ... (truncated if too long)
"""

History:
${historyText}

User Question: ${userMessage.content}

Instructions:
You are a legal AI assistant. Answer the user's question specifically based on the document provided. 
If the answer is not in the document, say so. 
Be professional, concise, and helpful. 
Cite specific sections if possible.
`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );

            if (!response.ok) throw new Error('AI request failed');

            const data = await response.json();
            const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Gemini API Error:', error);

            // Provide a more helpful fallback response
            const fallbackResponse = generateFallbackResponse(input, documentName);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: fallbackResponse,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // Show a subtle warning about API issues
            toast.warning('Using offline mode - Get a Gemini API key for full AI features', {
                description: 'Visit https://makersuite.google.com/app/apikey'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fallback response generator when API is unavailable
    const generateFallbackResponse = (question: string, docName: string): string => {
        const lowerQ = question.toLowerCase();

        if (lowerQ.includes('liability') || lowerQ.includes('liable')) {
            return `**Liability Analysis for ${docName}:**\n\nI would normally analyze the liability clauses in your document using AI, but the Gemini API is currently unavailable.\n\n**Common liability sections to review:**\n- Limitation of liability clauses\n- Indemnification provisions\n- Insurance requirements\n- Warranty disclaimers\n\n💡 **To enable full AI analysis**, add a valid Gemini API key to your .env file.`;
        }

        if (lowerQ.includes('termination') || lowerQ.includes('cancel')) {
            return `**Termination Analysis for ${docName}:**\n\nI would analyze termination clauses with AI, but the API is currently unavailable.\n\n**Key termination aspects to check:**\n- Notice period requirements\n- Termination for cause vs. convenience\n- Post-termination obligations\n- Survival clauses\n\n💡 **Get your Gemini API key** at: https://makersuite.google.com/app/apikey`;
        }

        if (lowerQ.includes('privacy') || lowerQ.includes('data') || lowerQ.includes('gdpr')) {
            return `**Privacy & Data Analysis for ${docName}:**\n\nFull AI analysis requires a valid Gemini API key.\n\n**Important privacy elements:**\n- Data processing provisions\n- GDPR/CCPA compliance clauses\n- Data security requirements\n- Data retention policies\n\n💡 **Enable AI features** by configuring your Gemini API key.`;
        }

        // Generic fallback
        return `**Analysis for "${question}":**\n\n⚠️ **AI Chat is currently unavailable** because the Gemini API key is not configured or has expired.\n\n**To enable full AI-powered contract analysis:**\n1. Visit https://makersuite.google.com/app/apikey\n2. Create a new API key\n3. Add it to your **.env** file as **VITE_GEMINI_API_KEY**\n4. Restart the development server\n\nIn the meantime, you can:\n- Review the full audit report\n- Check specific compliance standards\n- Export the document analysis\n\n*This is a fallback message. Once the API is configured, I'll provide intelligent, context-aware answers about your contract.*`;
    };

    return (
        <div className="flex flex-col h-[600px] glass-card rounded-xl overflow-hidden border border-border/50">
            {/* Header */}
            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">Chat with Contract</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{documentName}</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])}>
                    Clear Chat
                </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarImage src="/bot-avatar.png" />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}

                            <div
                                className={`rounded-2xl px-4 py-3 max-w-[80%] text-sm ${message.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                    : 'bg-muted/50 border border-border/50 rounded-tl-sm'
                                    }`}
                            >
                                <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                        __html: message.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                            .replace(/\n/g, '<br/>')
                                    }}
                                />
                            </div>

                            {message.role === 'user' && (
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-muted text-muted-foreground">
                                        <User className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <Avatar className="h-8 w-8 mt-1">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <Bot className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted/50 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about liability, termination, or privacy..."
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
