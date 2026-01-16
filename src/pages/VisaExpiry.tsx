import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCandidates } from '@/hooks/useCandidates';
import { differenceInDays, parseISO, format } from 'date-fns';
import { AlertTriangle, Calendar, User, FileText } from 'lucide-react';

interface ExpiringCandidate {
  id: string;
  full_name: string;
  passport_number: string | null;
  passport_expiry_date: string;
  daysLeft: number;
}

export default function VisaExpiry() {
  const { data: candidates, isLoading } = useCandidates();

  const expiringCandidates = useMemo(() => {
    if (!candidates) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiring: ExpiringCandidate[] = candidates
      .filter((candidate) => {
        if (!candidate.passport_expiry_date) return false;
        const expiryDate = parseISO(candidate.passport_expiry_date);
        const daysLeft = differenceInDays(expiryDate, today);
        return daysLeft >= 0 && daysLeft <= 15;
      })
      .map((candidate) => {
        const expiryDate = parseISO(candidate.passport_expiry_date!);
        const daysLeft = differenceInDays(expiryDate, today);
        return {
          id: candidate.id,
          full_name: candidate.full_name,
          passport_number: candidate.passport_number,
          passport_expiry_date: candidate.passport_expiry_date!,
          daysLeft,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    return expiring;
  }, [candidates]);

  const getUrgencyVariant = (daysLeft: number): "destructive" | "outline" | "secondary" => {
    if (daysLeft <= 3) return "destructive";
    if (daysLeft <= 7) return "outline";
    return "secondary";
  };

  const getUrgencyLabel = (daysLeft: number): string => {
    if (daysLeft === 0) return "Expires Today!";
    if (daysLeft === 1) return "1 day left";
    return `${daysLeft} days left`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Visa Expiry</h1>
          <p className="text-muted-foreground mt-1">
            Candidates with visas expiring within 15 days
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expiringCandidates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground">No Expiring Visas</h3>
              <p className="text-muted-foreground text-center mt-1">
                There are no candidates with visas expiring in the next 15 days.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="bg-destructive/10 border-destructive/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg text-destructive">
                    {expiringCandidates.length} Visa{expiringCandidates.length !== 1 ? 's' : ''} Expiring Soon
                  </CardTitle>
                </div>
                <CardDescription>
                  These candidates require immediate attention for visa renewal
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-4">
              {expiringCandidates.map((candidate) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {candidate.full_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {candidate.passport_number && (
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {candidate.passport_number}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              Expires: {format(parseISO(candidate.passport_expiry_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={getUrgencyVariant(candidate.daysLeft)}>
                        {getUrgencyLabel(candidate.daysLeft)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
