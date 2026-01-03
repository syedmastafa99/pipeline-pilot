import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STAGES, StageKey } from '@/lib/constants';
import { Candidate } from '@/hooks/useCandidates';
import { cn } from '@/lib/utils';

interface PipelineOverviewProps {
  candidates: Candidate[];
}

export function PipelineOverview({ candidates }: PipelineOverviewProps) {
  const stageCounts = STAGES.reduce((acc, stage) => {
    acc[stage.key] = candidates.filter(c => c.current_stage === stage.key).length;
    return acc;
  }, {} as Record<StageKey, number>);

  const maxCount = Math.max(...Object.values(stageCounts), 1);

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="font-display text-xl">Pipeline Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {STAGES.map((stage, index) => {
            const count = stageCounts[stage.key];
            const percentage = (count / maxCount) * 100;
            
            return (
              <div key={stage.key} className="group">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium">{stage.label}</span>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 group-hover:opacity-80',
                      `bg-${stage.color}`
                    )}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: `hsl(var(--${stage.color}))` 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
