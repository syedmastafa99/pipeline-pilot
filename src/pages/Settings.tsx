import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STAGES } from '@/lib/constants';
import { Database, Workflow } from 'lucide-react';
import { AdminDiagnostics } from '@/components/diagnostics/AdminDiagnostics';
export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your application settings
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pipeline Stages Info */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-lg">Pipeline Stages</CardTitle>
              </div>
              <CardDescription>
                Your recruitment workflow consists of {STAGES.length} stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {STAGES.map((stage, index) => (
                  <div
                    key={stage.key}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        backgroundColor: `hsl(var(--${stage.color}) / 0.15)`,
                        color: `hsl(var(--${stage.color}))`
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="font-medium">{stage.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle className="font-display text-lg">System Information</CardTitle>
              </div>
              <CardDescription>
                Application and database status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                <span className="text-sm">Database Status</span>
                <Badge variant="outline" className="bg-success/10 text-success">
                  Connected
                </Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                <span className="text-sm">Application</span>
                <Badge variant="outline">RecruitFlow v1.0</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
                <span className="text-sm">Backend</span>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  Lovable Cloud
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Diagnostics */}
        <AdminDiagnostics />
      </div>
    </AppLayout>
  );
}
