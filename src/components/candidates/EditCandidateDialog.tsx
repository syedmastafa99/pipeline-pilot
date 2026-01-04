import { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Candidate, useUpdateCandidate } from '@/hooks/useCandidates';
import { STAGES, StageKey } from '@/lib/constants';

interface EditCandidateDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCandidateDialog({ candidate, open, onOpenChange }: EditCandidateDialogProps) {
  const updateCandidate = useUpdateCandidate();

  const [formData, setFormData] = useState({
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
  });

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
      });
    }
  }, [candidate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidate || !formData.full_name.trim()) return;
    
    await updateCandidate.mutateAsync({
      id: candidate.id,
      ...formData,
    });
    
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!candidate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Candidate</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Full Name *</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_passport_number">Passport Number</Label>
              <Input
                id="edit_passport_number"
                value={formData.passport_number}
                onChange={(e) => handleChange('passport_number', e.target.value)}
                placeholder="AB1234567"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit_nationality">Nationality</Label>
              <Input
                id="edit_nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                placeholder="Pakistani"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_email">Email</Label>
            <Input
              id="edit_email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit_destination_country">Destination Country</Label>
              <Input
                id="edit_destination_country"
                value={formData.destination_country}
                onChange={(e) => handleChange('destination_country', e.target.value)}
                placeholder="Saudi Arabia"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_employer">Employer</Label>
              <Input
                id="edit_employer"
                value={formData.employer}
                onChange={(e) => handleChange('employer', e.target.value)}
                placeholder="Company Name"
              />
            </div>
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

          <div className="flex justify-end gap-3 pt-4">
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
