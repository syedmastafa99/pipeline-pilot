export const STAGES = [
  { key: 'passport_received', label: 'Passport Received', shortLabel: 'Passport', color: 'stage-passport' },
  { key: 'interview', label: 'Interview', shortLabel: 'Interview', color: 'stage-interview' },
  { key: 'medical', label: 'Medical', shortLabel: 'Medical', color: 'stage-medical' },
  { key: 'police_clearance', label: 'Police Clearance', shortLabel: 'Police', color: 'stage-police' },
  { key: 'mofa', label: 'MOFA', shortLabel: 'MOFA', color: 'stage-mofa' },
  { key: 'taseer', label: 'Taseer', shortLabel: 'Taseer', color: 'stage-taseer' },
  { key: 'takamul', label: 'Takamul', shortLabel: 'Takamul', color: 'stage-takamul' },
  { key: 'training', label: 'Training', shortLabel: 'Training', color: 'stage-training' },
  { key: 'fingerprint', label: 'Fingerprint', shortLabel: 'Fingerprint', color: 'stage-fingerprint' },
  { key: 'embassy', label: 'Embassy', shortLabel: 'Embassy', color: 'stage-embassy' },
  { key: 'visa_issued', label: 'Visa Issued', shortLabel: 'Visa', color: 'stage-visa' },
  { key: 'manpower', label: 'Manpower', shortLabel: 'Manpower', color: 'stage-manpower' },
  { key: 'flight', label: 'Flight', shortLabel: 'Flight', color: 'stage-flight' },
] as const;

export type StageKey = typeof STAGES[number]['key'];

export const STAGE_MAP = Object.fromEntries(
  STAGES.map((stage) => [stage.key, stage])
) as Record<StageKey, typeof STAGES[number]>;

export const getStageIndex = (stage: StageKey): number => {
  return STAGES.findIndex((s) => s.key === stage);
};

export const getStageLabel = (stage: StageKey): string => {
  return STAGE_MAP[stage]?.label || stage;
};

export const getNextStage = (currentStage: StageKey): StageKey | null => {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex < STAGES.length - 1) {
    return STAGES[currentIndex + 1].key;
  }
  return null;
};

export const getPreviousStage = (currentStage: StageKey): StageKey | null => {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex > 0) {
    return STAGES[currentIndex - 1].key;
  }
  return null;
};

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Medium', color: 'bg-info/10 text-info' },
  { value: 'high', label: 'High', color: 'bg-warning/10 text-warning' },
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-info/10 text-info' },
  { value: 'completed', label: 'Completed', color: 'bg-success/10 text-success' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-destructive/10 text-destructive' },
] as const;
