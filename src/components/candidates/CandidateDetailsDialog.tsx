import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageBadge } from './StageBadge';
import { DocumentChecklist } from './DocumentChecklist';
import { Candidate, useCandidateStageHistory } from '@/hooks/useCandidates';
import { STAGES, getStageIndex, getStageLabel } from '@/lib/constants';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  FileText,
  Globe,
  Calendar,
  Hash,
  CheckCircle2,
  Clock,
  ClipboardList
} from 'lucide-react';
import { format } from 'date-fns';

interface CandidateDetailsDialogProps {
  candidate: Candidate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidateDetailsDialog({ candidate, open, onOpenChange }: CandidateDetailsDialogProps) {
  const { data: stageHistory = [] } = useCandidateStageHistory(candidate?.id || '');
  
  if (!candidate) return null;

  const stageIndex = getStageIndex(candidate.current_stage);
  const progress = ((stageIndex + 1) / STAGES.length) * 100;
  
  // Create a map of stage to completion date
  const stageDates = stageHistory.reduce((acc, entry) => {
    acc[entry.stage] = entry.completed_at;
    return acc;
  }, {} as Record<string, string>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Stage Dates Timeline */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Stage Completion Dates
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {STAGES.map((stage, index) => {
                const completedDate = stageDates[stage.key];
                const isCompleted = index <= stageIndex;
                const isCurrent = stage.key === candidate.current_stage;
                
                return (
                  <div 
                    key={stage.key}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-sm ${
                      isCurrent 
                        ? 'border-primary bg-primary/5' 
                        : isCompleted 
                          ? 'border-green-500/30 bg-green-500/5' 
                          : 'border-muted bg-muted/30'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${isCurrent ? 'text-primary' : 'text-green-500'}`} />
                    ) : (
                      <Clock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`truncate font-medium ${isCompleted ? '' : 'text-muted-foreground'}`}>
                        {getStageLabel(stage.key)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {completedDate 
                          ? format(new Date(completedDate), 'MMM dd, yyyy')
                          : isCurrent 
                            ? 'In progress' 
                            : 'Pending'
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
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
            {candidate.visa_issue_date && (
              <DetailItem 
                icon={Calendar} 
                label="Visa Issue Date" 
                value={format(new Date(candidate.visa_issue_date), 'MMM dd, yyyy')} 
              />
            )}
            {candidate.visa_expiry_date && (
              <DetailItem 
                icon={Calendar} 
                label="Visa Expiry Date" 
                value={format(new Date(candidate.visa_expiry_date), 'MMM dd, yyyy')} 
              />
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

          {/* Document Checklist */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Document Checklist - {getStageLabel(candidate.current_stage)}
            </h4>
            <Tabs defaultValue={candidate.current_stage} className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
                {STAGES.slice(0, stageIndex + 1).map((stage) => (
                  <TabsTrigger 
                    key={stage.key} 
                    value={stage.key}
                    className="text-xs px-2 py-1"
                  >
                    {stage.shortLabel}
                  </TabsTrigger>
                ))}
              </TabsList>
              {STAGES.slice(0, stageIndex + 1).map((stage) => (
                <TabsContent key={stage.key} value={stage.key} className="mt-4">
                  <DocumentChecklist candidateId={candidate.id} stage={stage.key} />
                </TabsContent>
              ))}
            </Tabs>
          </div>
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
