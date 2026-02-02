import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, ArrowRight, ArrowLeftRight, GitGraph } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Compare() {
    const [originalId, setOriginalId] = useState<string | null>(null);
    const [revisedId, setRevisedId] = useState<string | null>(null);
    const [isComparing, setIsComparing] = useState(false);

    const { data: documents } = useQuery({
        queryKey: ['documents'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audits')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as any[]; // Temporary cast to avoid type issues if schema is not perfectly synced
        },
    });

    const handleCompare = () => {
        if (!originalId || !revisedId) {
            toast.error("Please select two documents to compare.");
            return;
        }
        if (originalId === revisedId) {
            toast.error("Please select different documents.");
            return;
        }
        setIsComparing(true);
        // In a real app, this would trigger a backend comparison or load the texts.
        // For this mock, we'll just show the visual state.
        setTimeout(() => {
            setIsComparing(false);
            toast.success("Comparison generated!");
        }, 1500);
    };

    return (
        <AppLayout>
            <div className="space-y-8 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Version Comparison</h1>
                    <p className="text-gray-400">Compare two contracts to identify changes, risks, and deviations.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
                    {/* Original Document Selection */}
                    <Card className="glass-card border-slate-700/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-cyan-400" />
                                Original Document
                            </CardTitle>
                            <CardDescription>Select the base contract version</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={setOriginalId}>
                                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700">
                                    <SelectValue placeholder="Select document..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {documents?.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            {doc.file_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Action Icon */}
                    <div className="flex justify-center">
                        <div className="rounded-full bg-slate-800 p-4 border border-slate-700 text-cyan-400">
                            <ArrowLeftRight className="h-6 w-6" />
                        </div>
                    </div>

                    {/* Revised Document Selection */}
                    <Card className="glass-card border-slate-700/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-400" />
                                Revised Document
                            </CardTitle>
                            <CardDescription>Select the new version to compare</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={setRevisedId}>
                                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700">
                                    <SelectValue placeholder="Select document..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {documents?.map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id}>
                                            {doc.file_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleCompare}
                        disabled={!originalId || !revisedId || isComparing}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 text-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                    >
                        {isComparing ? (
                            <>
                                <GitGraph className="mr-2 h-5 w-5 animate-pulse" />
                                Comparing...
                            </>
                        ) : (
                            <>
                                <GitGraph className="mr-2 h-5 w-5" />
                                Compare Versions
                            </>
                        )}
                    </Button>
                </div>

                {/* Mock Diff Result - would be populated after processing */}
                {(isComparing || (!isComparing && originalId && revisedId)) ? (
                    <div className={`mt-8 space-y-4 transition-opacity duration-500 ${isComparing ? 'opacity-50' : 'opacity-100'}`}>
                        {/* This is where the diff visualization would go */}
                        {/* For now, we wont implement the full diff view logic until we have that requirement, 
                     but the page structure is ready. */}
                    </div>
                ) : null}
            </div>
        </AppLayout>
    );
}
