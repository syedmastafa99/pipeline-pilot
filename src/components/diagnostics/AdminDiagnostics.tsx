import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, ShieldCheck, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DiagnosticResult {
  label: string;
  value: string | boolean | null;
  status: 'success' | 'error' | 'warning' | 'info';
  error?: string;
}

export function AdminDiagnostics() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    if (!user) return;

    setLoading(true);
    const diagnostics: DiagnosticResult[] = [];

    // User ID
    diagnostics.push({
      label: 'User ID',
      value: user.id,
      status: 'info',
    });

    // Email
    diagnostics.push({
      label: 'Email',
      value: user.email || 'Not available',
      status: 'info',
    });

    // Check has_role(admin)
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });

      if (error) {
        diagnostics.push({
          label: 'has_role(admin)',
          value: null,
          status: 'error',
          error: error.message,
        });
      } else {
        diagnostics.push({
          label: 'has_role(admin)',
          value: Boolean(data),
          status: data ? 'success' : 'warning',
        });
      }
    } catch (err) {
      diagnostics.push({
        label: 'has_role(admin)',
        value: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Check is_approved
    try {
      const { data, error } = await supabase.rpc('is_approved', {
        _user_id: user.id,
      });

      if (error) {
        diagnostics.push({
          label: 'is_approved',
          value: null,
          status: 'error',
          error: error.message,
        });
      } else {
        diagnostics.push({
          label: 'is_approved',
          value: Boolean(data),
          status: data ? 'success' : 'warning',
        });
      }
    } catch (err) {
      diagnostics.push({
        label: 'is_approved',
        value: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Check direct user_roles table access
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        diagnostics.push({
          label: 'user_roles table access',
          value: null,
          status: 'warning',
          error: error.message,
        });
      } else {
        const roles = data?.map((r) => r.role).join(', ') || 'No roles';
        diagnostics.push({
          label: 'user_roles table access',
          value: roles,
          status: 'success',
        });
      }
    } catch (err) {
      diagnostics.push({
        label: 'user_roles table access',
        value: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Check profiles table access
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved, email')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        diagnostics.push({
          label: 'profiles table access',
          value: null,
          status: 'warning',
          error: error.message,
        });
      } else if (data) {
        diagnostics.push({
          label: 'profiles table access',
          value: `is_approved: ${data.is_approved}`,
          status: 'success',
        });
      } else {
        diagnostics.push({
          label: 'profiles table access',
          value: 'No profile found',
          status: 'warning',
        });
      }
    } catch (err) {
      diagnostics.push({
        label: 'profiles table access',
        value: null,
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    setResults(diagnostics);
    setLastChecked(new Date());
    setLoading(false);
  };

  useEffect(() => {
    if (user && !authLoading) {
      runDiagnostics();
    }
  }, [user, authLoading]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (result: DiagnosticResult) => {
    if (result.error) {
      return (
        <Badge variant="destructive" className="text-xs">
          Error
        </Badge>
      );
    }

    if (typeof result.value === 'boolean') {
      return (
        <Badge
          variant="outline"
          className={
            result.value
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }
        >
          {result.value ? 'true' : 'false'}
        </Badge>
      );
    }

    return (
      <span className="max-w-[200px] truncate text-sm text-muted-foreground font-mono">
        {String(result.value)}
      </span>
    );
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Please sign in to run diagnostics
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle className="font-display text-lg">Admin Diagnostics</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runDiagnostics}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
        <CardDescription>
          Debug permission and role configuration
          {lastChecked && (
            <span className="ml-2 text-xs">
              · Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading && results.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          results.map((result, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <span className="text-sm font-medium">{result.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(result)}
              </div>
            </div>
          ))
        )}
        {results.some((r) => r.error) && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">Errors detected:</p>
            <ul className="mt-2 space-y-1 text-xs text-destructive/80">
              {results
                .filter((r) => r.error)
                .map((r, i) => (
                  <li key={i}>
                    <strong>{r.label}:</strong> {r.error}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
