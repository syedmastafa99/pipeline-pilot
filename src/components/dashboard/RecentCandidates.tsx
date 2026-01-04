import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Candidate, useDeleteCandidate } from '@/hooks/useCandidates';
import { STAGE_MAP } from '@/lib/constants';
import { CandidateDetailsDialog } from '@/components/candidates/CandidateDetailsDialog';
import { EditCandidateDialog } from '@/components/candidates/EditCandidateDialog';
import { formatDistanceToNow } from 'date-fns';
import { User, MapPin, Briefcase, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

interface RecentCandidatesProps {
  candidates: Candidate[];
}

export function RecentCandidates({ candidates }: RecentCandidatesProps) {
  const recentCandidates = candidates.slice(0, 5);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const deleteCandidate = useDeleteCandidate();

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowDetails(true);
  };

  const handleEdit = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setShowEdit(true);
  };

  const handleDelete = (candidate: Candidate) => {
    if (confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate.mutate(candidate.id);
    }
  };

  return (
    <>
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="font-display text-xl">Recent Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No candidates yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCandidates.map((candidate) => {
                const stage = STAGE_MAP[candidate.current_stage];
                return (
                  <div
                    key={candidate.id}
                    className="group flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{candidate.full_name}</span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: `hsl(var(--${stage?.color}) / 0.1)`,
                            color: `hsl(var(--${stage?.color}))`,
                          }}
                        >
                          {stage?.shortLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })}
                    </span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(candidate)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(candidate)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(candidate)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CandidateDetailsDialog 
        candidate={selectedCandidate}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
      
      <EditCandidateDialog
        candidate={selectedCandidate}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
    </>
  );
}
