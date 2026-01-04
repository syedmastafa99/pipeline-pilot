import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StageBadge } from './StageBadge';
import { Candidate } from '@/hooks/useCandidates';
import { STAGES, getStageIndex } from '@/lib/constants';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  FileText,
  Globe,
  Calendar,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';

interface CandidateDetailsDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateDetailsDialog({ candidate, open, onOpenChange }: CandidateDetailsDialogProps) {
  if (!candidate) return null;

  const stageIndex = getStageIndex(candidate.current_stage);
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Candidate Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header with name and stage */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{candidate.full_name}</h2>
              <div className="mt-1">
                <StageBadge stage={candidate.current_stage} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pipeline Progress</span>
              <span className="font-medium">{stageIndex + 1}/{STAGES.length} stages</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {candidate.passport_number && (
              <DetailItem icon={Hash} label="Passport Number" value={candidate.passport_number} />
            )}
            {candidate.nationality && (
              <DetailItem icon={Globe} label="Nationality" value={candidate.nationality} />
            )}
            {candidate.phone && (
              <DetailItem icon={Phone} label="Phone" value={candidate.phone} />
            )}
            {candidate.email && (
              <DetailItem icon={Mail} label="Email" value={candidate.email} />
            )}
            {candidate.destination_country && (
              <DetailItem icon={MapPin} label="Destination" value={candidate.destination_country} />
            )}
            {candidate.employer && (
              <DetailItem icon={Briefcase} label="Employer" value={candidate.employer} />
            )}
            {candidate.job_title && (
              <DetailItem icon={FileText} label="Job Title" value={candidate.job_title} />
            )}
            <DetailItem 
              icon={Calendar} 
              label="Added On" 
              value={format(new Date(candidate.created_at), 'MMM dd, yyyy')} 
            />
          </div>

          {/* Notes */}
          {candidate.notes && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
              <p className="rounded-lg bg-muted/50 p-3 text-sm">{candidate.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
