import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Candidate } from '@/hooks/useCandidates';
import { STAGE_MAP } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { User, MapPin, Briefcase } from 'lucide-react';

interface RecentCandidatesProps {
  candidates: Candidate[];
}

export function RecentCandidates({ candidates }: RecentCandidatesProps) {
  const recentCandidates = candidates.slice(0, 5);

  return (
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
                  className="flex items-center gap-4 rounded-lg border border-border/50 bg-muted/30 p-3 transition-all hover:border-border hover:bg-muted/50"
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
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
