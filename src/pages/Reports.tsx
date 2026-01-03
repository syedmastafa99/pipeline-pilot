import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReports, useGenerateDailyReport } from '@/hooks/useReports';
import { useCandidates } from '@/hooks/useCandidates';
import { STAGES } from '@/lib/constants';
import { format } from 'date-fns';
import { 
  RefreshCw, 
  Users, 
  UserPlus, 
  ArrowRightCircle, 
  FileCheck, 
  Plane,
  FileBarChart
} from 'lucide-react';

export default function Reports() {
  const { data: reports = [], isLoading } = useReports();
  const { data: candidates = [] } = useCandidates();
  const generateReport = useGenerateDailyReport();

  const todayReport = reports[0];

  // Calculate live stats
  const liveStats = {
    totalCandidates: candidates.length,
    byStage: STAGES.map(stage => ({
      ...stage,
      count: candidates.filter(c => c.current_stage === stage.key).length
    }))
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Daily Reports</h1>
            <p className="mt-1 text-muted-foreground">
              Generate and view daily activity reports
            </p>
          </div>
          <Button 
            onClick={() => generateReport.mutate(new Date())}
            disabled={generateReport.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generateReport.isPending ? 'animate-spin' : ''}`} />
            Generate Today's Report
          </Button>
        </div>

        {/* Live Stats */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="font-display text-xl">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {liveStats.byStage.map((stage, index) => (
                <div
                  key={stage.key}
                  className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      backgroundColor: `hsl(var(--${stage.color}) / 0.15)`,
                      color: `hsl(var(--${stage.color}))`
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{stage.label}</p>
                    <p className="text-2xl font-bold">{stage.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report History */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="font-display text-xl">Report History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading reports...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <FileBarChart className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-muted-foreground">No reports generated yet</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  Click "Generate Today's Report" to create your first report
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex flex-col gap-4 rounded-lg border border-border/50 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {format(new Date(report.report_date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Generated {format(new Date(report.created_at), 'h:mm a')}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="font-semibold">{report.total_candidates}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4 text-success" />
                        <div>
                          <p className="text-sm text-muted-foreground">New</p>
                          <p className="font-semibold">{report.new_candidates}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRightCircle className="h-4 w-4 text-info" />
                        <div>
                          <p className="text-sm text-muted-foreground">Stage Moves</p>
                          <p className="font-semibold">{report.stage_completions}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Flights</p>
                          <p className="font-semibold">{report.flights_completed}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
