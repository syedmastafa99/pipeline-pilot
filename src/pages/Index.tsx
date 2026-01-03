import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PipelineOverview } from '@/components/dashboard/PipelineOverview';
import { RecentCandidates } from '@/components/dashboard/RecentCandidates';
import { AddCandidateDialog } from '@/components/candidates/AddCandidateDialog';
import { useCandidates } from '@/hooks/useCandidates';
import { useTasks } from '@/hooks/useTasks';
import { STAGES } from '@/lib/constants';
import { 
  Users, 
  ClipboardCheck, 
  Plane, 
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export default function Index() {
  const { data: candidates = [], isLoading: candidatesLoading } = useCandidates();
  const { data: tasks = [] } = useTasks();

  const totalCandidates = candidates.length;
  const visasIssued = candidates.filter(c => c.current_stage === 'visa_issued' || c.current_stage === 'flight').length;
  const flightsCompleted = candidates.filter(c => c.current_stage === 'flight').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Track your recruitment pipeline at a glance
            </p>
          </div>
          <AddCandidateDialog />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Candidates"
            value={candidatesLoading ? '...' : totalCandidates}
            subtitle={`Across ${STAGES.length} stages`}
            icon={<Users className="h-6 w-6" />}
            variant="primary"
          />
          <StatsCard
            title="Visas Issued"
            value={visasIssued}
            subtitle="Ready for travel"
            icon={<FileCheck className="h-6 w-6" />}
            variant="success"
          />
          <StatsCard
            title="Flights Completed"
            value={flightsCompleted}
            subtitle="Successfully deployed"
            icon={<Plane className="h-6 w-6" />}
          />
          <StatsCard
            title="Pending Tasks"
            value={pendingTasks}
            subtitle={urgentTasks > 0 ? `${urgentTasks} urgent` : 'All on track'}
            icon={urgentTasks > 0 ? <AlertTriangle className="h-6 w-6" /> : <ClipboardCheck className="h-6 w-6" />}
            variant={urgentTasks > 0 ? 'warning' : 'default'}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PipelineOverview candidates={candidates} />
          <RecentCandidates candidates={candidates} />
        </div>
      </div>
    </AppLayout>
  );
}
