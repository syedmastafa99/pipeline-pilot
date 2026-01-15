import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCandidates, Candidate } from '@/hooks/useCandidates';
import { Search, FileText, Plus, Eye, Download, User } from 'lucide-react';
import { BioDataPreview } from '@/components/biodata/BioDataPreview';
import { BioDataEditor } from '@/components/biodata/BioDataEditor';

export interface CustomField {
  id: string;
  label: string;
  value: string;
}

export default function BioData() {
  const { data: candidates, isLoading } = useCandidates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const filteredCandidates = candidates?.filter(candidate => {
    const query = searchQuery.toLowerCase();
    return (
      candidate.full_name.toLowerCase().includes(query) ||
      candidate.passport_number?.toLowerCase().includes(query) ||
      candidate.surname?.toLowerCase().includes(query) ||
      candidate.given_name?.toLowerCase().includes(query)
    );
  }) || [];

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCustomFields([]);
    setShowPreview(false);
  };

  const handleAddField = () => {
    setCustomFields([
      ...customFields,
      { id: crypto.randomUUID(), label: '', value: '' }
    ]);
  };

  const handleUpdateField = (id: string, field: Partial<CustomField>) => {
    setCustomFields(customFields.map(f => 
      f.id === id ? { ...f, ...field } : f
    ));
  };

  const handleRemoveField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Bio Data</h1>
          <p className="text-muted-foreground">
            Generate bio data documents from candidate information
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Candidate Search Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="h-5 w-5" />
                Find Candidate
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search by passport number or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {isLoading ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading candidates...
                  </p>
                ) : filteredCandidates.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? 'No candidates found' : 'Start typing to search'}
                  </p>
                ) : (
                  filteredCandidates.slice(0, 20).map((candidate) => (
                    <button
                      key={candidate.id}
                      onClick={() => handleSelectCandidate(candidate)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {candidate.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {candidate.passport_number || 'No passport'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bio Data Editor */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Bio Data Editor
                </CardTitle>
                {selectedCandidate && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddField}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Field
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedCandidate ? (
                <BioDataEditor
                  candidate={selectedCandidate}
                  customFields={customFields}
                  onUpdateField={handleUpdateField}
                  onRemoveField={handleRemoveField}
                  onAddField={handleAddField}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Select a candidate to create bio data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      {selectedCandidate && (
        <BioDataPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          candidate={selectedCandidate}
          customFields={customFields}
        />
      )}
    </AppLayout>
  );
}
