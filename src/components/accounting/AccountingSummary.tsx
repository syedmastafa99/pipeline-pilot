import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Search, User } from 'lucide-react';
import { useAccountingSummary } from '@/hooks/useAccounting';
import { useCandidates } from '@/hooks/useCandidates';

export function AccountingSummary() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: summary, isLoading: summaryLoading } = useAccountingSummary(selectedCandidate);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter candidates based on search query
  const filteredCandidates = candidates?.filter(candidate => 
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.passport_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.employer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCandidateName = candidates?.find(c => c.id === selectedCandidate)?.full_name;

  const stats = [
    {
      title: 'Total Income',
      value: summary?.totalIncome || 0,
      monthlyValue: summary?.monthlyIncome || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Expenses',
      value: summary?.totalExpenses || 0,
      monthlyValue: summary?.monthlyExpenses || 0,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Net Profit',
      value: summary?.netProfit || 0,
      monthlyValue: summary?.monthlyNetProfit || 0,
      icon: DollarSign,
      color: (summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: (summary?.netProfit || 0) >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      title: 'This Month',
      value: summary?.monthlyNetProfit || 0,
      monthlyValue: null,
      icon: PiggyBank,
      color: (summary?.monthlyNetProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: 'bg-blue-100',
    },
  ];

  const isLoading = candidatesLoading || summaryLoading;

  return (
    <div className="space-y-4">
      {/* Candidate Search & Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Filter by Candidate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, passport, or employer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedCandidate || 'all'}
              onValueChange={(value) => setSelectedCandidate(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select candidate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Candidates</SelectItem>
                {filteredCandidates?.map((candidate) => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    {candidate.full_name} {candidate.passport_number ? `(${candidate.passport_number})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedCandidate && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing financial summary for: <span className="font-medium text-foreground">{selectedCandidateName}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 animate-pulse bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>
                        {formatCurrency(stat.value)}
                      </p>
                      {stat.monthlyValue !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          This month: {formatCurrency(stat.monthlyValue)}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
