import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Candidate, useUpdateCandidate } from '@/hooks/useCandidates';
import { STAGES, StageKey } from '@/lib/constants';
import { Upload, FileImage, User, Briefcase, Phone, Settings, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { addDays, differenceInDays, format } from 'date-fns';

// Helper function to calculate remaining days and get next steps
function calculateExpiryInfo(issueDate: string | null, validityDays: number) {
  if (!issueDate) return null;
  
  const issueDateObj = new Date(issueDate);
  const expiryDate = addDays(issueDateObj, validityDays);
  const today = new Date();
  const remainingDays = differenceInDays(expiryDate, today);
  
  return {
    expiryDate,
    remainingDays,
    isExpired: remainingDays < 0,
    isUrgent: remainingDays >= 0 && remainingDays <= 15,
  };
}

function getMedicalNextSteps(remainingDays: number): string[] {
  if (remainingDays < 0) {
    return ['Medical certificate has expired', 'Schedule new medical examination immediately'];
  }
  if (remainingDays <= 7) {
    return ['Critical: Complete police clearance urgently', 'Prepare all documents for next stage'];
  }
  if (remainingDays <= 15) {
    return ['Submit police clearance application', 'Ensure all medical documents are filed'];
  }
  if (remainingDays <= 30) {
    return ['Schedule police clearance appointment', 'Review document requirements'];
  }
  return ['Proceed with normal processing', 'Monitor expiry timeline'];
}

function getVisaNextSteps(remainingDays: number): string[] {
  if (remainingDays < 0) {
    return ['Visa has expired', 'Contact embassy for renewal or extension'];
  }
  if (remainingDays <= 7) {
    return ['Critical: Book flight immediately', 'Complete all pre-departure formalities'];
  }
  if (remainingDays <= 15) {
    return ['Finalize flight bookings', 'Complete manpower documentation'];
  }
  if (remainingDays <= 30) {
    return ['Start flight search', 'Prepare travel documents'];
  }
  return ['Proceed with normal processing', 'Monitor expiry timeline'];
}

interface EditCandidateDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  full_name: string;
  passport_number: string;
  nationality: string;
  phone: string;
  email: string;
  destination_country: string;
  employer: string;
  job_title: string;
  notes: string;
  current_stage: StageKey;
  surname: string;
  given_name: string;
  date_of_birth: string;
  sex: string;
  place_of_birth: string;
  passport_type: string;
  country_code: string;
  personal_number: string;
  previous_passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  issuing_authority: string;
  father_name: string;
  mother_name: string;
  legal_guardian_name: string;
  permanent_address: string;
  emergency_contact_name: string;
  emergency_contact_relationship: string;
  emergency_contact_address: string;
  emergency_contact_phone: string;
  passport_scan_url: string;
  visa_issue_date: string;
  visa_expiry_date: string;
  medical_fit_date: string;
  medical_expiry_date: string;
  agent_name: string;
  ref_company: string;
}

const initialFormData: FormData = {
  full_name: '',
  passport_number: '',
  nationality: '',
  phone: '',
  email: '',
  destination_country: '',
  employer: '',
  job_title: '',
  notes: '',
  current_stage: 'passport_received' as StageKey,
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
  visa_issue_date: '',
  visa_expiry_date: '',
  medical_fit_date: '',
  medical_expiry_date: '',
  agent_name: '',
  ref_company: '',
};

export function EditCandidateDialog({ candidate, open, onOpenChange }: EditCandidateDialogProps) {
  const updateCandidate = useUpdateCandidate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [uploading, setUploading] = useState(false);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (candidate) {
      setFormData({
        full_name: candidate.full_name || '',
        passport_number: candidate.passport_number || '',
        nationality: candidate.nationality || '',
        phone: candidate.phone || '',
        email: candidate.email || '',
        destination_country: candidate.destination_country || '',
        employer: candidate.employer || '',
        job_title: candidate.job_title || '',
        notes: candidate.notes || '',
        current_stage: candidate.current_stage,
        surname: candidate.surname || '',
        given_name: candidate.given_name || '',
        date_of_birth: candidate.date_of_birth || '',
        sex: candidate.sex || '',
        place_of_birth: candidate.place_of_birth || '',
        passport_type: candidate.passport_type || 'P',
        country_code: candidate.country_code || '',
        personal_number: candidate.personal_number || '',
        previous_passport_number: candidate.previous_passport_number || '',
        passport_issue_date: candidate.passport_issue_date || '',
        passport_expiry_date: candidate.passport_expiry_date || '',
        issuing_authority: candidate.issuing_authority || '',
        father_name: candidate.father_name || '',
        mother_name: candidate.mother_name || '',
        legal_guardian_name: candidate.legal_guardian_name || '',
        permanent_address: candidate.permanent_address || '',
        emergency_contact_name: candidate.emergency_contact_name || '',
        emergency_contact_relationship: candidate.emergency_contact_relationship || '',
        emergency_contact_address: candidate.emergency_contact_address || '',
        emergency_contact_phone: candidate.emergency_contact_phone || '',
        passport_scan_url: candidate.passport_scan_url || '',
        visa_issue_date: candidate.visa_issue_date || '',
        visa_expiry_date: candidate.visa_expiry_date || '',
        medical_fit_date: candidate.medical_fit_date || '',
        medical_expiry_date: candidate.medical_expiry_date || '',
        agent_name: candidate.agent_name || '',
        ref_company: candidate.ref_company || '',
      });
      
      // Load passport preview if exists
      if (candidate.passport_scan_url) {
        loadPassportPreview(candidate.passport_scan_url);
      } else {
        setPassportPreview(null);
      }
    }
  }, [candidate]);

  const loadPassportPreview = async (filePath: string) => {
    try {
      const { data } = await supabase.storage
        .from('candidate-documents')
        .createSignedUrl(filePath, 300);
      
      if (data?.signedUrl) {
        setPassportPreview(data.signedUrl);
      }
    } catch (error) {
      console.error('Error loading passport preview:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate || !formData.full_name.trim()) return;
    
    // Auto-calculate expiry dates
    let calculatedMedicalExpiry = formData.medical_expiry_date;
    let calculatedVisaExpiry = formData.visa_expiry_date;
    
    if (formData.medical_fit_date) {
      const medicalFitDate = new Date(formData.medical_fit_date);
      const medicalExpiryDate = new Date(medicalFitDate);
      medicalExpiryDate.setDate(medicalExpiryDate.getDate() + 60);
      calculatedMedicalExpiry = medicalExpiryDate.toISOString().split('T')[0];
    }
    
    if (formData.visa_issue_date) {
      const visaIssueDate = new Date(formData.visa_issue_date);
      const visaExpiryDate = new Date(visaIssueDate);
      visaExpiryDate.setDate(visaExpiryDate.getDate() + 90);
      calculatedVisaExpiry = visaExpiryDate.toISOString().split('T')[0];
    }
    
    // Convert empty date strings to null for proper database storage
    const sanitizedData = {
      ...formData,
      date_of_birth: formData.date_of_birth || null,
      passport_issue_date: formData.passport_issue_date || null,
      passport_expiry_date: formData.passport_expiry_date || null,
      visa_issue_date: formData.visa_issue_date || null,
      visa_expiry_date: calculatedVisaExpiry || null,
      medical_fit_date: formData.medical_fit_date || null,
      medical_expiry_date: calculatedMedicalExpiry || null,
    };
    
    await updateCandidate.mutateAsync({
      id: candidate.id,
      ...sanitizedData,
    });
    
    onOpenChange(false);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('Please upload an image or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/passport-scans/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('candidate-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, passport_scan_url: fileName }));
      
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

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Candidate</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="passport" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="passport" className="text-xs">
                <FileImage className="h-4 w-4 mr-1 hidden sm:inline" />
                Passport
              </TabsTrigger>
              <TabsTrigger value="personal" className="text-xs">
                <User className="h-4 w-4 mr-1 hidden sm:inline" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="employment" className="text-xs">
                <Briefcase className="h-4 w-4 mr-1 hidden sm:inline" />
                Employment
              </TabsTrigger>
              <TabsTrigger value="emergency" className="text-xs">
                <Phone className="h-4 w-4 mr-1 hidden sm:inline" />
                Emergency
              </TabsTrigger>
              <TabsTrigger value="status" className="text-xs">
                <Settings className="h-4 w-4 mr-1 hidden sm:inline" />
                Status
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
                          Image or PDF, max 10MB
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

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_passport_type">Passport Type</Label>
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
                    <Label htmlFor="edit_country_code">Country Code</Label>
                    <Input
                      id="edit_country_code"
                      value={formData.country_code}
                      onChange={(e) => handleChange('country_code', e.target.value.toUpperCase())}
                      placeholder="BGD"
                      maxLength={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_passport_number">Passport Number</Label>
                    <Input
                      id="edit_passport_number"
                      value={formData.passport_number}
                      onChange={(e) => handleChange('passport_number', e.target.value.toUpperCase())}
                      placeholder="A19677982"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_surname">Surname</Label>
                    <Input
                      id="edit_surname"
                      value={formData.surname}
                      onChange={(e) => handleChange('surname', e.target.value.toUpperCase())}
                      placeholder="MIAH"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_given_name">Given Name</Label>
                    <Input
                      id="edit_given_name"
                      value={formData.given_name}
                      onChange={(e) => handleChange('given_name', e.target.value.toUpperCase())}
                      placeholder="TAMIM"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_full_name">Full Name *</Label>
                    <Input
                      id="edit_full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="TAMIM MIAH"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_nationality">Nationality</Label>
                    <Input
                      id="edit_nationality"
                      value={formData.nationality}
                      onChange={(e) => handleChange('nationality', e.target.value.toUpperCase())}
                      placeholder="BANGLADESHI"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_date_of_birth">Date of Birth</Label>
                    <Input
                      id="edit_date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_sex">Sex</Label>
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
                    <Label htmlFor="edit_place_of_birth">Place of Birth</Label>
                    <Input
                      id="edit_place_of_birth"
                      value={formData.place_of_birth}
                      onChange={(e) => handleChange('place_of_birth', e.target.value.toUpperCase())}
                      placeholder="BRAHMANBARIA"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_personal_number">Personal No.</Label>
                    <Input
                      id="edit_personal_number"
                      value={formData.personal_number}
                      onChange={(e) => handleChange('personal_number', e.target.value)}
                      placeholder="8732309573"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_previous_passport_number">Previous Passport No.</Label>
                    <Input
                      id="edit_previous_passport_number"
                      value={formData.previous_passport_number}
                      onChange={(e) => handleChange('previous_passport_number', e.target.value.toUpperCase())}
                      placeholder="738977"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit_passport_issue_date">Date of Issue</Label>
                    <Input
                      id="edit_passport_issue_date"
                      type="date"
                      value={formData.passport_issue_date}
                      onChange={(e) => handleChange('passport_issue_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_passport_expiry_date">Date of Expiry</Label>
                    <Input
                      id="edit_passport_expiry_date"
                      type="date"
                      value={formData.passport_expiry_date}
                      onChange={(e) => handleChange('passport_expiry_date', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_issuing_authority">Issuing Authority</Label>
                    <Input
                      id="edit_issuing_authority"
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
                    <Label htmlFor="edit_father_name">Father's Name</Label>
                    <Input
                      id="edit_father_name"
                      value={formData.father_name}
                      onChange={(e) => handleChange('father_name', e.target.value.toUpperCase())}
                      placeholder="MD JOYNAL ABDDIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_mother_name">Mother's Name</Label>
                    <Input
                      id="edit_mother_name"
                      value={formData.mother_name}
                      onChange={(e) => handleChange('mother_name', e.target.value.toUpperCase())}
                      placeholder="SABINA YESMIN"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_legal_guardian_name">Legal Guardian's Name</Label>
                  <Input
                    id="edit_legal_guardian_name"
                    value={formData.legal_guardian_name}
                    onChange={(e) => handleChange('legal_guardian_name', e.target.value.toUpperCase())}
                    placeholder="If applicable"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_permanent_address">Permanent Address</Label>
                  <Textarea
                    id="edit_permanent_address"
                    value={formData.permanent_address}
                    onChange={(e) => handleChange('permanent_address', e.target.value)}
                    placeholder="NASIRABAD, NABINAGAR, NASIRABAD - 3413, BRAHMANBARIA"
                    rows={2}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Phone</Label>
                    <Input
                      id="edit_phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+8801707869351"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_email">Email</Label>
                    <Input
                      id="edit_email"
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
                  <Label htmlFor="edit_destination_country">Destination Country</Label>
                  <Input
                    id="edit_destination_country"
                    value={formData.destination_country}
                    onChange={(e) => handleChange('destination_country', e.target.value)}
                    placeholder="Saudi Arabia"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_employer">Employer</Label>
                    <Input
                      id="edit_employer"
                      value={formData.employer}
                      onChange={(e) => handleChange('employer', e.target.value)}
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_job_title">Job Title</Label>
                    <Input
                      id="edit_job_title"
                      value={formData.job_title}
                      onChange={(e) => handleChange('job_title', e.target.value)}
                      placeholder="Driver, Mason, etc."
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit_agent_name">Agent Name</Label>
                    <Input
                      id="edit_agent_name"
                      value={formData.agent_name}
                      onChange={(e) => handleChange('agent_name', e.target.value)}
                      placeholder="Agent Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_ref_company">Ref Company</Label>
                    <Input
                      id="edit_ref_company"
                      value={formData.ref_company}
                      onChange={(e) => handleChange('ref_company', e.target.value)}
                      placeholder="Reference Company"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_notes">Notes</Label>
                  <Textarea
                    id="edit_notes"
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
                    <Label htmlFor="edit_emergency_contact_name">Contact Name</Label>
                    <Input
                      id="edit_emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value.toUpperCase())}
                      placeholder="MD JOYNAL ABDDIN"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_emergency_contact_relationship">Relationship</Label>
                    <Input
                      id="edit_emergency_contact_relationship"
                      value={formData.emergency_contact_relationship}
                      onChange={(e) => handleChange('emergency_contact_relationship', e.target.value.toUpperCase())}
                      placeholder="FATHER"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_contact_address">Contact Address</Label>
                  <Textarea
                    id="edit_emergency_contact_address"
                    value={formData.emergency_contact_address}
                    onChange={(e) => handleChange('emergency_contact_address', e.target.value)}
                    placeholder="NASIRABAD, NABINAGAR, NASIRABAD - 3413, BRAHMANBARIA"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit_emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="edit_emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    placeholder="+8801707869351"
                  />
                </div>
              </TabsContent>

              {/* Status Tab */}
              <TabsContent value="status" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="edit_stage">Current Stage</Label>
                  <Select 
                    value={formData.current_stage} 
                    onValueChange={(value) => handleChange('current_stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.key} value={stage.key}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.current_stage === 'medical' && (
                  <MedicalExpirySection 
                    medicalFitDate={formData.medical_fit_date}
                    onMedicalFitDateChange={(value) => handleChange('medical_fit_date', value)}
                  />
                )}

                {formData.current_stage === 'visa_issued' && (
                  <VisaExpirySection
                    visaIssueDate={formData.visa_issue_date}
                    onVisaIssueDateChange={(value) => handleChange('visa_issue_date', value)}
                  />
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateCandidate.isPending}>
              {updateCandidate.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Medical Expiry Section Component
function MedicalExpirySection({ 
  medicalFitDate, 
  onMedicalFitDateChange 
}: { 
  medicalFitDate: string; 
  onMedicalFitDateChange: (value: string) => void;
}) {
  const expiryInfo = useMemo(() => 
    calculateExpiryInfo(medicalFitDate || null, 60), 
    [medicalFitDate]
  );

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-medium mb-4">Medical Information</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit_medical_fit_date">Medical Fit Date</Label>
          <Input
            id="edit_medical_fit_date"
            type="date"
            value={medicalFitDate}
            onChange={(e) => onMedicalFitDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Medical Expiry (60 days)</Label>
          {expiryInfo ? (
            <div className={`rounded-lg border p-3 ${
              expiryInfo.isExpired 
                ? 'bg-destructive/10 border-destructive/50' 
                : expiryInfo.isUrgent 
                  ? 'bg-amber-500/10 border-amber-500/50' 
                  : 'bg-muted/50 border-muted'
            }`}>
              <div className="flex items-center gap-2">
                {expiryInfo.isExpired ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : expiryInfo.isUrgent ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`text-lg font-bold ${
                  expiryInfo.isExpired 
                    ? 'text-destructive' 
                    : expiryInfo.isUrgent 
                      ? 'text-amber-500' 
                      : 'text-foreground'
                }`}>
                  {expiryInfo.isExpired 
                    ? `Expired ${Math.abs(expiryInfo.remainingDays)} days ago` 
                    : `${expiryInfo.remainingDays} days remaining`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expires: {format(expiryInfo.expiryDate, 'dd MMM yyyy')}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm text-muted-foreground">
              Enter medical fit date to see expiry
            </div>
          )}
        </div>
      </div>
      
      {expiryInfo && (
        <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Next Steps
          </h5>
          <ul className="space-y-1">
            {getMedicalNextSteps(expiryInfo.remainingDays).map((step, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Visa Expiry Section Component
function VisaExpirySection({ 
  visaIssueDate, 
  onVisaIssueDateChange 
}: { 
  visaIssueDate: string; 
  onVisaIssueDateChange: (value: string) => void;
}) {
  const expiryInfo = useMemo(() => 
    calculateExpiryInfo(visaIssueDate || null, 90), 
    [visaIssueDate]
  );

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-medium mb-4">Visa Information</h4>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="edit_visa_issue_date">Visa Issue Date</Label>
          <Input
            id="edit_visa_issue_date"
            type="date"
            value={visaIssueDate}
            onChange={(e) => onVisaIssueDateChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Visa Expiry (90 days)</Label>
          {expiryInfo ? (
            <div className={`rounded-lg border p-3 ${
              expiryInfo.isExpired 
                ? 'bg-destructive/10 border-destructive/50' 
                : expiryInfo.isUrgent 
                  ? 'bg-amber-500/10 border-amber-500/50' 
                  : 'bg-muted/50 border-muted'
            }`}>
              <div className="flex items-center gap-2">
                {expiryInfo.isExpired ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : expiryInfo.isUrgent ? (
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className={`text-lg font-bold ${
                  expiryInfo.isExpired 
                    ? 'text-destructive' 
                    : expiryInfo.isUrgent 
                      ? 'text-amber-500' 
                      : 'text-foreground'
                }`}>
                  {expiryInfo.isExpired 
                    ? `Expired ${Math.abs(expiryInfo.remainingDays)} days ago` 
                    : `${expiryInfo.remainingDays} days remaining`}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Expires: {format(expiryInfo.expiryDate, 'dd MMM yyyy')}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-muted bg-muted/30 p-3 text-sm text-muted-foreground">
              Enter visa issue date to see expiry
            </div>
          )}
        </div>
      </div>
      
      {expiryInfo && (
        <div className="mt-4 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
            <ArrowRight className="h-4 w-4 text-primary" />
            Next Steps
          </h5>
          <ul className="space-y-1">
            {getVisaNextSteps(expiryInfo.remainingDays).map((step, idx) => (
              <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary">•</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}