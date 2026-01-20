import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { useAccountingSummary } from '@/hooks/useAccounting';

export function AccountingSummary() {
  const { data: summary, isLoading } = useAccountingSummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
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
  );
}
