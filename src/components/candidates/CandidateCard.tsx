import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Candidate, useUpdateCandidateStage, useDeleteCandidate } from '@/hooks/useCandidates';
import { STAGES, getNextStage, getStageIndex } from '@/lib/constants';
import { StageBadge } from './StageBadge';
import { CandidateDetailsDialog } from './CandidateDetailsDialog';
import { EditCandidateDialog } from './EditCandidateDialog';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase,
  MoreHorizontal,
  ChevronRight,
  Trash2,
  ArrowRight,
  Eye,
  Pencil
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CandidateCardProps {
  candidate: Candidate;
  onEdit?: (candidate: Candidate) => void;
}

export function CandidateCard({ candidate, onEdit }: CandidateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  
  const updateStage = useUpdateCandidateStage();
  const deleteCandidate = useDeleteCandidate();
  
  const nextStage = getNextStage(candidate.current_stage);
  const stageIndex = getStageIndex(candidate.current_stage);
  const progress = ((stageIndex + 1) / STAGES.length) * 100;

  const handleAdvanceStage = () => {
    if (nextStage) {
      updateStage.mutate({ id: candidate.id, stage: nextStage });
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate.mutate(candidate.id);
    }
  };

  return (
    <>
      <Card className="group animate-scale-in overflow-hidden transition-all hover:shadow-elegant">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">{candidate.full_name}</h3>
                {candidate.passport_number && (
                  <p className="text-xs text-muted-foreground">
                    {candidate.passport_number}
                  </p>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {candidate.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {candidate.phone}
                </span>
              )}
              {candidate.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {candidate.email}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {candidate.destination_country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {candidate.destination_country}
                </span>
              )}
              {candidate.job_title && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {candidate.job_title}
                </span>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <StageBadge stage={candidate.current_stage} size="sm" />
              <span className="text-xs text-muted-foreground">
                {stageIndex + 1}/{STAGES.length}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {nextStage && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full justify-between text-xs hover:bg-primary/5 hover:text-primary"
              onClick={handleAdvanceStage}
              disabled={updateStage.isPending}
            >
              <span>Move to next stage</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}

          <p className="mt-2 text-xs text-muted-foreground">
            Added {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>

      <CandidateDetailsDialog 
        candidate={candidate}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
      
      <EditCandidateDialog
        candidate={candidate}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
}
