import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  user_id: string;
  candidate_id: string | null;
  type: 'income' | 'expense';
  category_id: string | null;
  amount: number;
  description: string | null;
  transaction_date: string;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expense_categories?: ExpenseCategory;
  candidates?: { full_name: string } | null;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  candidate_id: string | null;
  invoice_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  candidates?: { full_name: string } | null;
  invoice_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  created_at: string;
}

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          expense_categories(name),
          candidates(full_name)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useExpenseCategories() {
  return useQuery({
    queryKey: ['expense_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as ExpenseCategory[];
    },
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          candidates(full_name),
          invoice_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'expense_categories' | 'candidates'>) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...transaction, user_id: user.user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error adding transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({ title: 'Transaction deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting transaction', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      invoice, 
      items 
    }: { 
      invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'candidates' | 'invoice_items'>; 
      items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[] 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({ ...invoice, user_id: user.user.id })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map(item => ({
          ...item,
          invoice_id: invoiceData.id,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return invoiceData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating invoice', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating invoice', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting invoice', description: error.message, variant: 'destructive' });
    },
  });
}

export function useAccountingSummary() {
  return useQuery({
    queryKey: ['accounting_summary'],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('type, amount, transaction_date');

      if (error) throw error;

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        monthlyNetProfit: 0,
      };

      transactions?.forEach((t) => {
        const amount = Number(t.amount);
        const date = new Date(t.transaction_date);
        const isThisMonth = date.getMonth() === thisMonth && date.getFullYear() === thisYear;

        if (t.type === 'income') {
          summary.totalIncome += amount;
          if (isThisMonth) summary.monthlyIncome += amount;
        } else {
          summary.totalExpenses += amount;
          if (isThisMonth) summary.monthlyExpenses += amount;
        }
      });

      summary.netProfit = summary.totalIncome - summary.totalExpenses;
      summary.monthlyNetProfit = summary.monthlyIncome - summary.monthlyExpenses;

      return summary;
    },
  });
}
