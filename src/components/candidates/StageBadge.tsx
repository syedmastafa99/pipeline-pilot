import { Badge } from '@/components/ui/badge';
import { STAGE_MAP, StageKey } from '@/lib/constants';

interface StageBadgeProps {
  stage: StageKey;
  size?: 'sm' | 'default';
}

export function StageBadge({ stage, size = 'default' }: StageBadgeProps) {
  const stageInfo = STAGE_MAP[stage];
  
  return (
    <Badge
      variant="secondary"
      className={size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}
      style={{
        backgroundColor: `hsl(var(--${stageInfo?.color}) / 0.15)`,
        color: `hsl(var(--${stageInfo?.color}))`,
        borderColor: `hsl(var(--${stageInfo?.color}) / 0.3)`,
      }}
    >
      {stageInfo?.label || stage}
    </Badge>
  );
}
