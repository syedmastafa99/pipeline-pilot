import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCandidate, CreateCandidateInput } from '@/hooks/useCandidates';
import { Plus, Upload, FileImage, User, Briefcase, Phone, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AddCandidateDialogProps {
  trigger?: React.ReactNode;
}

const initialFormData: CreateCandidateInput = {
  full_name: '',
  passport_number: '',
  nationality: '',
  phone: '',
  email: '',
  destination_country: '',
  employer: '',
  job_title: '',
  notes: '',
  // Passport fields
  surname: '',
  given_name: '',
  date_of_birth: '',
  sex: '',
  place_of_birth: '',
  passport_type: 'P',
  country_code: '',
  personal_number: '',
  previous_passport_number: '',
  passport_issue_date: '',
  passport_expiry_date: '',
  issuing_authority: '',
  father_name: '',
  mother_name: '',
  legal_guardian_name: '',
  permanent_address: '',
  emergency_contact_name: '',
  emergency_contact_relationship: '',
  emergency_contact_address: '',
  emergency_contact_phone: '',
  passport_scan_url: '',
};

export function AddCandidateDialog({ trigger }: AddCandidateDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCandidateInput>(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createCandidate = useCreateCandidate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name.trim()) return;
    
    await createCandidate.mutateAsync(formData);
    
    setFormData(initialFormData);
    setPassportPreview(null);
    setOpen(false);
  };

  const handleChange = (field: keyof CreateCandidateInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-fill full_name from surname and given_name
    if (field === 'surname' || field === 'given_name') {
      const surname = field === 'surname' ? value : formData.surname || '';
      const givenName = field === 'given_name' ? value : formData.given_name || '';
      const fullName = `${givenName} ${surname}`.trim();
      if (fullName) {
        setFormData(prev => ({ ...prev, [field]: value, full_name: fullName }));
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/passport-scans/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('candidate-documents')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, passport_scan_url: fileName }));
      
      // Set preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPassportPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPassportPreview(null);
      }

      toast.success('Passport scan uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload passport scan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Candidate
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Candidate</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="passport" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="passport" className="text-xs sm:text-sm">
                <FileImage className="h-4 w-4 mr-1 hidden sm:inline" />
                Passport Info
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1 hidden sm:inline" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="employment" className="text-xs sm:text-sm">
                <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs sm:text-sm">
                <Phone className="h-4 w-4 mr-1 hidden sm:inline" />
                Emergency
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[50vh] mt-4 pr-4">
              {/* Passport Info Tab */}
              <TabsContent value="passport" className="space-y-4 mt-0">
                {/* Passport Scan Upload */}
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {passportPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={passportPreview} 
                        alt="Passport preview" 
                        className="max-h-40 mx-auto rounded-md object-contain"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        Change Passport Scan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <Upload className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Upload Passport Scan</p>
                        <p className="text-xs text-muted-foreground">
                          Drag and drop or click to upload (Image or PDF, max 10MB)
                        </p>
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? 'Uploading...' : 'Select File'}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>Fill in the passport details from the scanned document below</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="passport_type">Passport Type</Label>
                    <Select 
                      value={formData.passport_type || 'P'} 
                      onValueChange={(value) => handleChange('passport_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">P (Passport)</SelectItem>
                        <SelectItem value="D">D (Diplomatic)</SelectItem>
                        <SelectItem value="S">S (Service)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country_code">Country Code</Label>
                    <Input
                      id="country_code"
                      value={formData.country_code}
                      onChange={(e) => handleChange('country_code', e.target.value.toUpperCase())}
                      placeholder="BGD"
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_number">Passport Number *</Label>
                    <Input
                      id="passport_number"
                      value={formData.passport_number}
                      onChange={(e) => handleChange('passport_number', e.target.value.toUpperCase())}
                      placeholder="A19677982"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => handleChange('surname', e.target.value.toUpperCase())}
                      placeholder="MIAH"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="given_name">Given Name</Label>
                    <Input
                      id="given_name"
                      value={formData.given_name}
                      onChange={(e) => handleChange('given_name', e.target.value.toUpperCase())}
                      placeholder="TAMIM"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="TAMIM MIAH"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value.toUpperCase())}
                      placeholder="BANGLADESHI"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sex</Label>
                    <Select 
                      value={formData.sex || ''} 
                      onValueChange={(value) => handleChange('sex', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Male</SelectItem>
                        <SelectItem value="F">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place_of_birth">Place of Birth</Label>
                    <Input
                      id="place_of_birth"
                      value={formData.place_of_birth}
                      onChange={(e) => handleChange('place_of_birth', e.target.value.toUpperCase())}
                      placeholder="BRAHMANBARIA"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="personal_number">Personal No.</Label>
                    <Input
                      id="personal_number"
                      value={formData.personal_number}
                      onChange={(e) => handleChange('personal_number', e.target.value)}
                      placeholder="8732309573"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previous_passport_number">Previous Passport No.</Label>
                    <Input
                      id="previous_passport_number"
                      value={formData.previous_passport_number}
                      onChange={(e) => handleChange('previous_passport_number', e.target.value.toUpperCase())}
                      placeholder="738977"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="passport_issue_date">Date of Issue</Label>
                    <Input
                      id="passport_issue_date"
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleChange('passport_issue_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passport_expiry_date">Date of Expiry</Label>
                    <Input
                      id="passport_expiry_date"
                      type="date"
                      value={formData.passport_expiry_date}
                      onChange={(e) => handleChange('passport_expiry_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="issuing_authority">Issuing Authority</Label>
                    <Input
                      id="issuing_authority"
                      value={formData.issuing_authority}
                      onChange={(e) => handleChange('issuing_authority', e.target.value.toUpperCase())}
                      placeholder="DIP/DHAKA"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Personal Data Tab */}
              <TabsContent value="personal" className="space-y-4 mt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="father_name">Father's Name</Label>
                    <Input
                      id="father_name"
                      value={formData.father_name}
                      onChange={(e) => handleChange('father_name', e.target.value.toUpperCase())}
                      placeholder="MD JOYNAL ABDDIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mother_name">Mother's Name</Label>
                    <Input
                      id="mother_name"
                      value={formData.mother_name}
                      onChange={(e) => handleChange('mother_name', e.target.value.toUpperCase())}
                      placeholder="SABINA YESMIN"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_guardian_name">Legal Guardian's Name</Label>
                  <Input
                    id="legal_guardian_name"
                    value={formData.legal_guardian_name}
                    onChange={(e) => handleChange('legal_guardian_name', e.target.value.toUpperCase())}
                    placeholder="If applicable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permanent_address">Permanent Address</Label>
                  <Textarea
                    id="permanent_address"
                    value={formData.permanent_address}
                    onChange={(e) => handleChange('permanent_address', e.target.value)}
                    placeholder="NASIRABAD, NABINAGAR, NASIRABAD - 3413, BRAHMANBARIA"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+8801707869351"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="destination_country">Destination Country</Label>
                  <Input
                    id="destination_country"
                    value={formData.destination_country}
                    onChange={(e) => handleChange('destination_country', e.target.value)}
                    placeholder="Saudi Arabia"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                      id="employer"
                      value={formData.employer}
                      onChange={(e) => handleChange('employer', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="job_title">Job Title</Label>
                    <Input
                      id="job_title"
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="Driver, Mason, etc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </TabsContent>

              {/* Emergency Contact Tab */}
              <TabsContent value="emergency" className="space-y-4 mt-0">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value.toUpperCase())}
                      placeholder="MD JOYNAL ABDDIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                    <Input
                      id="emergency_contact_relationship"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => handleChange('emergency_contact_relationship', e.target.value.toUpperCase())}
                      placeholder="FATHER"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_address">Contact Address</Label>
                  <Textarea
                    id="emergency_contact_address"
                    value={formData.emergency_contact_address}
                    onChange={(e) => handleChange('emergency_contact_address', e.target.value)}
                    placeholder="NASIRABAD, NABINAGAR, NASIRABAD - 3413, BRAHMANBARIA"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    placeholder="+8801707869351"
                  />
                </div>
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createCandidate.isPending}>
              {createCandidate.isPending ? 'Adding...' : 'Add Candidate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}