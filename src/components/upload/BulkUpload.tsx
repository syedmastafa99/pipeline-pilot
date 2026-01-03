import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBulkCreateCandidates, CreateCandidateInput } from '@/hooks/useCandidates';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BulkUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [parseResult, setParseResult] = useState<{
    candidates: CreateCandidateInput[];
    errors: string[];
  } | null>(null);
  
  const bulkCreate = useBulkCreateCandidates();

  const parseCSV = (text: string): { candidates: CreateCandidateInput[]; errors: string[] } => {
    const lines = text.trim().split('\n');
    const candidates: CreateCandidateInput[] = [];
    const errors: string[] = [];

    if (lines.length < 2) {
      return { candidates: [], errors: ['File must contain a header row and at least one data row'] };
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredFields = ['full_name'];
    
    const missingRequired = requiredFields.filter(f => !headers.includes(f));
    if (missingRequired.length > 0) {
      return { candidates: [], errors: [`Missing required columns: ${missingRequired.join(', ')}`] };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      const candidate: CreateCandidateInput = { full_name: '' };
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (value) {
          switch (header) {
            case 'full_name':
              candidate.full_name = value;
              break;
            case 'passport_number':
              candidate.passport_number = value;
              break;
            case 'nationality':
              candidate.nationality = value;
              break;
            case 'phone':
              candidate.phone = value;
              break;
            case 'email':
              candidate.email = value;
              break;
            case 'destination_country':
              candidate.destination_country = value;
              break;
            case 'employer':
              candidate.employer = value;
              break;
            case 'job_title':
              candidate.job_title = value;
              break;
            case 'notes':
              candidate.notes = value;
              break;
          }
        }
      });

      if (!candidate.full_name) {
        errors.push(`Row ${i + 1}: Missing full_name`);
        continue;
      }

      candidates.push(candidate);
    }

    return { candidates, errors };
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setParseResult({ candidates: [], errors: ['Please upload a CSV file'] });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      setParseResult(result);
    };
    reader.readAsText(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const handleImport = async () => {
    if (parseResult && parseResult.candidates.length > 0) {
      await bulkCreate.mutateAsync(parseResult.candidates);
      setParseResult(null);
    }
  };

  const downloadTemplate = () => {
    const headers = 'full_name,passport_number,nationality,phone,email,destination_country,employer,job_title,notes';
    const example = 'John Doe,AB1234567,Pakistani,+92 300 1234567,john@example.com,Saudi Arabia,Company Name,Driver,Additional notes';
    const content = `${headers}\n${example}`;
    
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="font-display text-xl">Bulk Upload Candidates</CardTitle>
          <CardDescription>
            Upload a CSV file to import multiple candidates at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>

          <div
            className={cn(
              'relative rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports .csv files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {parseResult && (
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              {parseResult.candidates.length > 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Ready to Import
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Import Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {parseResult.candidates.length > 0 && (
              <div className="rounded-lg bg-success/10 p-4">
                <p className="font-medium text-success">
                  {parseResult.candidates.length} candidate(s) ready for import
                </p>
              </div>
            )}

            {parseResult.errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 p-4">
                <p className="mb-2 font-medium text-destructive">Errors found:</p>
                <ul className="list-inside list-disc space-y-1 text-sm text-destructive">
                  {parseResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {parseResult.candidates.length > 0 && (
              <div className="flex gap-3">
                <Button onClick={handleImport} disabled={bulkCreate.isPending}>
                  <Upload className="mr-2 h-4 w-4" />
                  {bulkCreate.isPending ? 'Importing...' : `Import ${parseResult.candidates.length} Candidates`}
                </Button>
                <Button variant="outline" onClick={() => setParseResult(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
