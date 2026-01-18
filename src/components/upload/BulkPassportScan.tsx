import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBulkCreateCandidates, CreateCandidateInput } from '@/hooks/useCandidates';
import { ScanLine, Upload, X, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ScannedPassport {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'success' | 'error' | 'duplicate';
  data?: CreateCandidateInput;
  error?: string;
}

interface ExtractedPassportData {
  passport_type?: string;
  country_code?: string;
  passport_number?: string;
  surname?: string;
  given_name?: string;
  nationality?: string;
  date_of_birth?: string;
  sex?: string;
  place_of_birth?: string;
  personal_number?: string;
  previous_passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  issuing_authority?: string;
  father_name?: string;
  mother_name?: string;
  permanent_address?: string;
  emergency_contact_name?: string;
  emergency_contact_relationship?: string;
  emergency_contact_address?: string;
  emergency_contact_phone?: string;
}

export function BulkPassportScan() {
  const [dragActive, setDragActive] = useState(false);
  const [passports, setPassports] = useState<ScannedPassport[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  
  const bulkCreate = useBulkCreateCandidates();

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractPassportData = async (passport: ScannedPassport): Promise<{ data?: CreateCandidateInput; error?: string }> => {
    try {
      const base64 = await fileToBase64(passport.file);
      
      const { data, error } = await supabase.functions.invoke('passport-ocr', {
        body: { 
          imageBase64: base64,
          mimeType: passport.file.type 
        }
      });

      if (error) {
        return { error: error.message || 'Failed to extract data' };
      }

      if (data?.success && data?.data) {
        const extracted: ExtractedPassportData = data.data;
        const fullName = [extracted.given_name, extracted.surname].filter(Boolean).join(' ') || 'Unknown';
        
        return {
          data: {
            full_name: fullName,
            passport_type: extracted.passport_type,
            country_code: extracted.country_code,
            passport_number: extracted.passport_number,
            surname: extracted.surname,
            given_name: extracted.given_name,
            nationality: extracted.nationality,
            date_of_birth: extracted.date_of_birth,
            sex: extracted.sex,
            place_of_birth: extracted.place_of_birth,
            personal_number: extracted.personal_number,
            previous_passport_number: extracted.previous_passport_number,
            passport_issue_date: extracted.passport_issue_date,
            passport_expiry_date: extracted.passport_expiry_date,
            issuing_authority: extracted.issuing_authority,
            father_name: extracted.father_name,
            mother_name: extracted.mother_name,
            permanent_address: extracted.permanent_address,
            emergency_contact_name: extracted.emergency_contact_name,
            emergency_contact_relationship: extracted.emergency_contact_relationship,
            emergency_contact_address: extracted.emergency_contact_address,
            emergency_contact_phone: extracted.emergency_contact_phone,
          }
        };
      }

      return { error: data?.message || 'Could not extract passport data' };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  const addFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isImage && isValidSize;
    });

    const newPassports: ScannedPassport[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }));

    setPassports(prev => [...prev, ...newPassports]);
  }, []);

  const removePassport = (id: string) => {
    setPassports(prev => {
      const passport = prev.find(p => p.id === id);
      if (passport) {
        URL.revokeObjectURL(passport.preview);
      }
      return prev.filter(p => p.id !== id);
    });
  };

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
    
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
    e.target.value = '';
  }, [addFiles]);

  const checkDuplicatePassport = async (passportNumber: string): Promise<boolean> => {
    if (!passportNumber) return false;
    
    const { data } = await supabase
      .from('candidates')
      .select('id')
      .eq('passport_number', passportNumber)
      .limit(1);
    
    return (data && data.length > 0);
  };

  const processAllPassports = async () => {
    const pendingPassports = passports.filter(p => p.status === 'pending' || p.status === 'error');
    if (pendingPassports.length === 0) return;

    setIsProcessing(true);
    setProcessedCount(0);

    for (let i = 0; i < pendingPassports.length; i++) {
      const passport = pendingPassports[i];
      
      setPassports(prev => prev.map(p => 
        p.id === passport.id ? { ...p, status: 'processing' } : p
      ));

      const result = await extractPassportData(passport);
      
      // Check for duplicate if extraction was successful
      let isDuplicate = false;
      if (result.data?.passport_number) {
        isDuplicate = await checkDuplicatePassport(result.data.passport_number);
      }
      
      setPassports(prev => prev.map(p => 
        p.id === passport.id 
          ? { 
              ...p, 
              status: isDuplicate ? 'duplicate' : (result.data ? 'success' : 'error'),
              data: result.data,
              error: isDuplicate ? `Passport ${result.data?.passport_number} already exists` : result.error
            } 
          : p
      ));

      setProcessedCount(i + 1);
      
      // Small delay between requests to avoid rate limiting
      if (i < pendingPassports.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    const duplicateCount = passports.filter(p => p.status === 'duplicate').length;
    if (duplicateCount > 0) {
      toast.warning(`${duplicateCount} duplicate passport(s) found`);
    }
    toast.success(`Processed ${pendingPassports.length} passport(s)`);
  };

  const handleImport = async () => {
    const validCandidates = passports
      .filter(p => p.status === 'success' && p.data)
      .map(p => p.data!);

    if (validCandidates.length === 0) {
      toast.error('No valid passport data to import');
      return;
    }

    try {
      await bulkCreate.mutateAsync(validCandidates);
      // Clear all passports after successful import
      passports.forEach(p => URL.revokeObjectURL(p.preview));
      setPassports([]);
      toast.success(`Successfully imported ${validCandidates.length} candidate(s)`);
    } catch (error) {
      toast.error('Failed to import candidates');
    }
  };

  const clearAll = () => {
    passports.forEach(p => URL.revokeObjectURL(p.preview));
    setPassports([]);
    setProcessedCount(0);
  };

  const pendingCount = passports.filter(p => p.status === 'pending').length;
  const successCount = passports.filter(p => p.status === 'success').length;
  const errorCount = passports.filter(p => p.status === 'error').length;
  const duplicateCount = passports.filter(p => p.status === 'duplicate').length;
  const processingCount = passports.filter(p => p.status === 'processing').length;
  const totalToProcess = pendingCount + errorCount;

  return (
    <div className="space-y-6">
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <ScanLine className="h-5 w-5" />
            Bulk Passport Scan
          </CardTitle>
          <CardDescription>
            Upload multiple passport scans to automatically extract candidate data using AI vision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              accept="image/*"
              multiple
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isProcessing}
            />
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium">
              Drag and drop passport images here, or click to browse
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Supports JPG, PNG images up to 10MB each. Select multiple files.
            </p>
          </div>
        </CardContent>
      </Card>

      {passports.length > 0 && (
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-lg">
                Passport Queue ({passports.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearAll}
                  disabled={isProcessing}
                >
                  Clear All
                </Button>
                <Button 
                  size="sm" 
                  onClick={processAllPassports}
                  disabled={isProcessing || totalToProcess === 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing ({processedCount}/{totalToProcess})
                    </>
                  ) : (
                    <>
                      <ScanLine className="mr-2 h-4 w-4" />
                      Extract All ({totalToProcess})
                    </>
                  )}
                </Button>
              </div>
            </div>
            {isProcessing && (
              <Progress 
                value={(processedCount / totalToProcess) * 100} 
                className="mt-2"
              />
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {passports.map((passport) => (
                  <div 
                    key={passport.id}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border bg-card transition-all",
                      passport.status === 'success' && "border-success/50",
                      passport.status === 'error' && "border-destructive/50",
                      passport.status === 'duplicate' && "border-warning/50",
                      passport.status === 'processing' && "border-primary/50"
                    )}
                  >
                    <div className="aspect-[3/4] overflow-hidden">
                      <img 
                        src={passport.preview} 
                        alt="Passport scan"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    {/* Status overlay */}
                    <div className={cn(
                      "absolute inset-0 flex items-center justify-center bg-background/80 transition-opacity",
                      passport.status === 'pending' && "opacity-0 group-hover:opacity-100",
                      passport.status === 'processing' && "opacity-100",
                      passport.status === 'success' && "opacity-0",
                      passport.status === 'error' && "opacity-80",
                      passport.status === 'duplicate' && "opacity-80"
                    )}>
                      {passport.status === 'processing' && (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      )}
                      {passport.status === 'error' && (
                        <div className="p-2 text-center">
                          <AlertCircle className="mx-auto h-6 w-6 text-destructive" />
                          <p className="mt-1 text-xs text-destructive">{passport.error}</p>
                        </div>
                      )}
                      {passport.status === 'duplicate' && (
                        <div className="p-2 text-center">
                          <AlertCircle className="mx-auto h-6 w-6 text-amber-500" />
                          <p className="mt-1 text-xs text-amber-600">{passport.error}</p>
                        </div>
                      )}
                    </div>

                    {/* Success badge */}
                    {passport.status === 'success' && (
                      <div className="absolute right-2 top-2">
                        <CheckCircle2 className="h-6 w-6 text-success drop-shadow-md" />
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => removePassport(passport.id)}
                      disabled={isProcessing}
                      className="absolute left-2 top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity hover:bg-destructive/90 group-hover:opacity-100 disabled:cursor-not-allowed"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Info footer */}
                    {passport.status === 'success' && passport.data && (
                      <div className="border-t bg-muted/50 p-2">
                        <p className="truncate text-xs font-medium">
                          {passport.data.full_name}
                        </p>
                        {passport.data.passport_number && (
                          <p className="truncate text-xs text-muted-foreground">
                            {passport.data.passport_number}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Summary and import section */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-4">
              <div className="flex flex-wrap gap-4 text-sm">
                {pendingCount > 0 && (
                  <span className="text-muted-foreground">
                    {pendingCount} pending
                  </span>
                )}
                {processingCount > 0 && (
                  <span className="text-primary">
                    {processingCount} processing
                  </span>
                )}
                {successCount > 0 && (
                  <span className="text-success">
                    {successCount} ready
                  </span>
                )}
                {errorCount > 0 && (
                  <span className="text-destructive">
                    {errorCount} failed
                  </span>
                )}
                {duplicateCount > 0 && (
                  <span className="text-amber-500">
                    {duplicateCount} duplicate
                  </span>
                )}
              </div>
              
              {successCount > 0 && (
                <Button 
                  onClick={handleImport}
                  disabled={bulkCreate.isPending || isProcessing}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {bulkCreate.isPending 
                    ? 'Importing...' 
                    : `Import ${successCount} Candidate${successCount > 1 ? 's' : ''}`
                  }
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
