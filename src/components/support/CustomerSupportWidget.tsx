import { useState } from 'react';
import { MessageCircle, X, HelpCircle, Bot, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FAQSection } from './FAQSection';
import { AIChatBot } from './AIChatBot';

type SupportView = 'menu' | 'faq' | 'chat' | null;

export function CustomerSupportWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [currentView, setCurrentView] = useState<SupportView>('menu');

    const handleClose = () => {
        setIsOpen(false);
        // Reset to menu after animation completes
        setTimeout(() => setCurrentView('menu'), 300);
    };

    const handleOpenFAQ = () => {
        setCurrentView('faq');
    };

    const handleOpenChat = () => {
        setCurrentView('chat');
    };

    const handleBackToMenu = () => {
        setCurrentView('menu');
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl transition-all duration-300",
                        "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
                        "hover:scale-110 active:scale-95",
                        isOpen && "rotate-90"
                    )}
                    size="icon"
                >
                    {isOpen ? (
                        <X className="h-6 w-6 text-white" />
                    ) : (
                        <MessageCircle className="h-6 w-6 text-white" />
                    )}
                </Button>
            </div>

            {/* Support Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={handleClose}
                    />

                    {/* Panel */}
                    <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-slide-up">
                        <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                            {/* Menu View */}
                            {currentView === 'menu' && (
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-foreground">How can we help?</h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleClose}
                                            className="h-8 w-8"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <button
                                            onClick={handleOpenFAQ}
                                            className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                                                <HelpCircle className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-foreground">FAQs</p>
                                                <p className="text-sm text-muted-foreground">Get quick answers</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </button>

                                        <button
                                            onClick={handleOpenChat}
                                            className="w-full flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all group"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                                <Bot className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-semibold text-foreground">Talk with AI</p>
                                                <p className="text-sm text-muted-foreground">Chat with our assistant</p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* FAQ View */}
                            {currentView === 'faq' && (
                                <FAQSection onBack={handleBackToMenu} onClose={handleClose} />
                            )}

                            {/* Chat View */}
                            {currentView === 'chat' && (
                                <AIChatBot onBack={handleBackToMenu} onClose={handleClose} />
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
