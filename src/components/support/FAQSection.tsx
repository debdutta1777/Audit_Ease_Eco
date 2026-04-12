import { ChevronLeft, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQSectionProps {
    onBack: () => void;
    onClose: () => void;
}

const faqs = [
    {
        question: 'What is AuditEase?',
        answer: 'AuditEase is an AI-powered compliance auditing platform that helps organizations quickly identify gaps in their contracts and documents against industry standards like GDPR, HIPAA, SOC 2, and more.',
    },
    {
        question: 'How do I create a new audit?',
        answer: 'Click on "New Audit" in the sidebar, upload your document, select the compliance standard you want to audit against, and click "Start Audit". Our AI will analyze your document and provide a detailed gap analysis.',
    },
    {
        question: 'What file formats are supported?',
        answer: 'We support PDF, DOCX, TXT, and most common document formats. Files should be under 10MB for optimal performance.',
    },
    {
        question: 'How long does an audit take?',
        answer: 'Most audits complete within 2-5 minutes, depending on document length and complexity. You\'ll receive a notification when your audit is ready.',
    },
    {
        question: 'Can I export audit results?',
        answer: 'Yes! You can export your audit results as PDF reports. Professional and Enterprise plans include additional export formats and customization options.',
    },
    {
        question: 'Is my data secure?',
        answer: 'Absolutely. We use bank-level encryption (AES-256) for data at rest and in transit. We\'re SOC 2 Type II certified and GDPR compliant. Your documents are never used for AI training.',
    },
    {
        question: 'What compliance standards do you support?',
        answer: 'We support major standards including GDPR, HIPAA, SOC 2, ISO 27001, PCI DSS, and more. Professional plans allow you to upload custom compliance standards.',
    },
    {
        question: 'How do I upgrade my plan?',
        answer: 'Visit the Billing page from the sidebar, select your desired plan, and click "Start Free Trial" or "Upgrade". All plans include a 14-day free trial.',
    },
];

export function FAQSection({ onBack, onClose }: FAQSectionProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="flex flex-col h-[500px]">
            {/* Header */}
            <div className="flex items-center gap-2 p-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h3 className="flex-1 font-bold text-foreground">Frequently Asked Questions</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* FAQ List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-border rounded-lg overflow-hidden bg-card"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                        >
                            <span className="font-medium text-foreground pr-2">{faq.question}</span>
                            <ChevronDown
                                className={cn(
                                    "h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform",
                                    expandedIndex === index && "rotate-180"
                                )}
                            />
                        </button>
                        {expandedIndex === index && (
                            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
