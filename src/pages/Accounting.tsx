import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountingSummary } from '@/components/accounting/AccountingSummary';
import { AddTransactionDialog } from '@/components/accounting/AddTransactionDialog';
import { TransactionsList } from '@/components/accounting/TransactionsList';
import { CreateInvoiceDialog } from '@/components/accounting/CreateInvoiceDialog';
import { InvoicesList } from '@/components/accounting/InvoicesList';
import { Calculator, Receipt, FileText } from 'lucide-react';

export default function Accounting() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calculator className="h-8 w-8" />
            Accounting
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage income, expenses, and invoices
          </p>
        </div>

        {/* Summary Cards */}
        <AccountingSummary />

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <div className="flex justify-end">
              <AddTransactionDialog />
            </div>
            <TransactionsList />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex justify-end">
              <CreateInvoiceDialog />
            </div>
            <InvoicesList />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
