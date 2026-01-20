import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  CalendarIcon, 
  User, 
  DollarSign,
  FileText,
  Download
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { useTransactions, Transaction } from '@/hooks/useAccounting';
import { useCandidates } from '@/hooks/useCandidates';
import { cn } from '@/lib/utils';

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export function CandidateFinancialReport() {
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(subMonths(new Date(), 2)),
    to: endOfMonth(new Date()),
  });
  const [datePreset, setDatePreset] = useState<string>('3months');

  // Filter candidates based on search
  const filteredCandidates = candidates?.filter(candidate => 
    candidate.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.passport_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.employer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Apply date preset
  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    
    switch (preset) {
      case 'thisMonth':
        setDateRange({
          from: startOfMonth(now),
          to: endOfMonth(now),
        });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        setDateRange({
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        });
        break;
      case '3months':
        setDateRange({
          from: startOfMonth(subMonths(now, 2)),
          to: endOfMonth(now),
        });
        break;
      case '6months':
        setDateRange({
          from: startOfMonth(subMonths(now, 5)),
          to: endOfMonth(now),
        });
        break;
      case 'year':
        setDateRange({
          from: new Date(now.getFullYear(), 0, 1),
          to: endOfMonth(now),
        });
        break;
      case 'all':
        setDateRange({
          from: undefined,
          to: undefined,
        });
        break;
    }
  };

  // Filter transactions based on candidate and date range
  const filteredTransactions = useMemo(() => {
    return transactions?.filter((t) => {
      const matchesCandidate = selectedCandidate === 'all' || t.candidate_id === selectedCandidate;
      
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        const transactionDate = new Date(t.transaction_date);
        matchesDate = isWithinInterval(transactionDate, {
          start: dateRange.from,
          end: dateRange.to,
        });
      }
      
      return matchesCandidate && matchesDate;
    }) || [];
  }, [transactions, selectedCandidate, dateRange]);

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totals = {
      income: 0,
      expenses: 0,
      netProfit: 0,
      transactionCount: filteredTransactions.length,
    };
    
    filteredTransactions.forEach((t) => {
      const amount = Number(t.amount);
      if (t.type === 'income') {
        totals.income += amount;
      } else {
        totals.expenses += amount;
      }
    });
    
    totals.netProfit = totals.income - totals.expenses;
    return totals;
  }, [filteredTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const selectedCandidateName = candidates?.find(c => c.id === selectedCandidate)?.full_name;

  const isLoading = transactionsLoading || candidatesLoading;

  if (isLoading) {
    return <div className="text-center py-8">Loading report...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Candidate Financial Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Candidate Selection */}
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
              value={selectedCandidate}
              onValueChange={setSelectedCandidate}
            >
              <SelectTrigger className="w-full sm:w-[300px]">
                <User className="h-4 w-4 mr-2" />
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

          {/* Date Range Selection */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={datePreset} onValueChange={handleDatePreset}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thisMonth">This Month</SelectItem>
                <SelectItem value="lastMonth">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? format(dateRange.from, "MMM dd, yyyy") : "From date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, from: date }));
                      setDatePreset('custom');
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal flex-1",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "MMM dd, yyyy") : "To date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => {
                      setDateRange(prev => ({ ...prev, to: date }));
                      setDatePreset('custom');
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedCandidate !== 'all' && (
            <p className="text-sm text-muted-foreground">
              Showing report for: <span className="font-medium text-foreground">{selectedCandidateName}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.income)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.expenses)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={cn(
                  "text-2xl font-bold",
                  summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {formatCurrency(summary.netProfit)}
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-full",
                summary.netProfit >= 0 ? "bg-green-100" : "bg-red-100"
              )}>
                <DollarSign className={cn(
                  "h-5 w-5",
                  summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {summary.transactionCount}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transaction History</span>
            <span className="text-sm font-normal text-muted-foreground">
              {filteredTransactions.length} records
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    {selectedCandidate === 'all' && <TableHead>Candidate</TableHead>}
                    <TableHead>Payment Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className="flex items-center gap-1 w-fit"
                        >
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{transaction.description || '-'}</p>
                          {transaction.reference_number && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {transaction.reference_number}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.expense_categories?.name || '-'}
                      </TableCell>
                      {selectedCandidate === 'all' && (
                        <TableCell>
                          {transaction.candidates?.full_name || '-'}
                        </TableCell>
                      )}
                      <TableCell className="capitalize">
                        {transaction.payment_method?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell className={cn(
                        "text-right font-medium",
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(Number(transaction.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters or date range</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
