import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { FileText, Trash2, Download, Search, Filter, FolderOpen, Grid, List, MoreVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  document_type: string;
  file_size: number | null;
  file_path: string;
  created_at: string;
}

export default function DocumentVault() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('id, name, document_type, file_size, file_path, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load documents');
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, filePath: string) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      toast.error('Failed to delete file from storage');
      return;
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (dbError) {
      toast.error('Failed to delete document record');
      return;
    }

    setDocuments(documents.filter(doc => doc.id !== id));
    toast.success('Document deleted successfully');
  };

  const handleDownload = async (filePath: string, fileName: string, docId: string) => {
    if (filePath.startsWith('preset/')) {
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('extracted_text')
        .eq('id', docId)
        .single();

      if (docError || !docData?.extracted_text) {
        toast.error('Failed to download file');
        return;
      }

      const blob = new Blob([docData.extracted_text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return;
    }

    const { data, error } = await supabase.storage
      .from('documents')
      .download(filePath);

    if (error) {
      toast.error('Failed to download file');
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Document Vault</h1>
            <p className="text-muted-foreground">Securely manage your compliance documents and standards.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8"
            >
              <Grid className="h-4 w-4 mr-2" /> Grid
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Tabs defaultValue="all" value={typeFilter} onValueChange={setTypeFilter} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All Files</TabsTrigger>
              <TabsTrigger value="standard">Standards</TabsTrigger>
              <TabsTrigger value="subject">Contracts</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/60 backdrop-blur-sm focus:bg-card transition-all"
            />
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted/50" />
            ))}
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center border-dashed border-2">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {documents.length === 0 ? 'Vault is Empty' : 'No documents found'}
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {documents.length === 0
                ? 'Upload documents during a new audit to save them here safely.'
                : 'Try adjusting your filters or search query to find what you need.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="group glass-card rounded-xl p-4 hover:border-primary/50 transition-all hover:shadow-lg flex flex-col justify-between h-[200px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload(doc.file_path, doc.name, doc.id)}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(doc.id, doc.file_path)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 py-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-center line-clamp-2 px-2" title={doc.name}>{doc.name}</h3>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal bg-background/50">
                    {doc.document_type === 'standard' ? 'STD' : 'DOC'}
                  </Badge>
                  <span>{formatFileSize(doc.file_size)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[50%]">Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium truncate max-w-[200px] sm:max-w-md">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doc.document_type === 'standard' ? 'default' : 'secondary'} className="font-normal">
                        {doc.document_type === 'standard' ? 'Standard' : 'Subject'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {formatFileSize(doc.file_size)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(doc.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(doc.file_path, doc.name, doc.id)}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{doc.name}"?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(doc.id, doc.file_path)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
