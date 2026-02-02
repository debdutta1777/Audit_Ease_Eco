import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploaderProps {
  type: 'standard' | 'subject';
  onUploadComplete: (document: { id: string; name: string; file_path: string }) => void;
  uploadedDocument?: { id: string; name: string } | null;
  onRemove?: () => void;
}

// Helper to load PDF.js from CDN
const loadPdfJs = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).pdfjsLib) {
      resolve((window as any).pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(pdfjsLib);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export function DocumentUploader({
  type,
  onUploadComplete,
  uploadedDocument,
  onRemove
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const title = type === 'standard'
    ? 'The Standard (Regulation/Law)'
    : 'The Subject (Contract/Handbook)';

  const description = type === 'standard'
    ? 'Upload the regulatory document, compliance framework, or law that will be used as the benchmark.'
    : 'Upload the contract, employee handbook, or policy document to be audited against the standard.';

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to upload files.', variant: 'destructive' });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please upload a file smaller than 10MB.', variant: 'destructive' });
      return;
    }

    setIsUploading(true);

    try {
      // Extract text from PDF
      let extractedText = '';
      try {
        const pdfjsLib = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const textParts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
          textParts.push(pageText);
        }
        extractedText = textParts.join('\n\n');
        console.log('Extracted text length:', extractedText.length);
      } catch (pdfError) {
        console.error('PDF extraction error:', pdfError);
      }

      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          name: file.name,
          document_type: type,
          file_path: filePath,
          file_size: file.size,
          extracted_text: extractedText || null
        })
        .select('id, name, file_path')
        .single();

      if (dbError) throw dbError;

      onUploadComplete(docData);

      if (extractedText.length < 100) {
        toast({
          title: 'Upload successful',
          description: `${file.name} uploaded. Note: Limited text was extracted from this PDF.`
        });
      } else {
        toast({ title: 'Upload successful', description: `${file.name} has been uploaded and text extracted.` });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadedDocument) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
          <CheckCircle className="h-5 w-5 text-success" />
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium text-foreground truncate">{uploadedDocument.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
          )}

          <div>
            <p className="font-medium text-foreground">
              {isUploading ? 'Uploading & extracting text...' : 'Drag & drop your PDF here'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse (max 10MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}