import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Eye, CheckCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useInvoices, useDeleteInvoice, useUpdateInvoice, Invoice } from '@/hooks/useAccounting';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export function InvoicesList() {
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { mutate: updateInvoice } = useUpdateInvoice();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
    }).format(amount);
  };

  const markAsSent = (invoice: Invoice) => {
    updateInvoice({ id: invoice.id, status: 'sent' });
  };

  const markAsPaid = (invoice: Invoice) => {
    updateInvoice({ 
      id: invoice.id, 
      status: 'paid', 
      amount_paid: invoice.total_amount,
      paid_date: new Date().toISOString().split('T')[0],
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading invoices...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Invoices</span>
          <span className="text-sm font-normal text-muted-foreground">
            {invoices?.length || 0} invoices
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices && invoices.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono font-medium">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invoice.client_name}</p>
                        {invoice.client_email && (
                          <p className="text-xs text-muted-foreground">{invoice.client_email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {invoice.candidates?.full_name || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {invoice.due_date 
                        ? format(new Date(invoice.due_date), 'MMM dd, yyyy')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[invoice.status] || statusColors.draft}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(invoice.total_amount))}
                      {Number(invoice.amount_paid) > 0 && Number(invoice.amount_paid) < Number(invoice.total_amount) && (
                        <p className="text-xs text-muted-foreground">
                          Paid: {formatCurrency(Number(invoice.amount_paid))}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Invoice */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Invoice {invoice.invoice_number}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground">Client</p>
                                  <p className="font-medium">{invoice.client_name}</p>
                                  {invoice.client_email && <p>{invoice.client_email}</p>}
                                  {invoice.client_phone && <p>{invoice.client_phone}</p>}
                                  {invoice.client_address && <p>{invoice.client_address}</p>}
                                </div>
                                <div className="text-right">
                                  <p className="text-muted-foreground">Issue Date</p>
                                  <p className="font-medium">
                                    {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                                  </p>
                                  {invoice.due_date && (
                                    <>
                                      <p className="text-muted-foreground mt-2">Due Date</p>
                                      <p className="font-medium">
                                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>

                              {invoice.invoice_items && invoice.invoice_items.length > 0 && (
                                <div className="border rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-center">Qty</TableHead>
                                        <TableHead className="text-right">Unit Price</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {invoice.invoice_items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.description}</TableCell>
                                          <TableCell className="text-center">{item.quantity}</TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(Number(item.unit_price))}
                                          </TableCell>
                                          <TableCell className="text-right">
                                            {formatCurrency(Number(item.total))}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}

                              <div className="border-t pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Subtotal</span>
                                  <span>{formatCurrency(Number(invoice.subtotal))}</span>
                                </div>
                                {Number(invoice.tax_rate) > 0 && (
                                  <div className="flex justify-between">
                                    <span>Tax ({invoice.tax_rate}%)</span>
                                    <span>{formatCurrency(Number(invoice.tax_amount))}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t pt-2">
                                  <span>Total</span>
                                  <span>{formatCurrency(Number(invoice.total_amount))}</span>
                                </div>
                              </div>

                              {invoice.notes && (
                                <div className="border-t pt-4">
                                  <p className="text-sm text-muted-foreground">Notes</p>
                                  <p className="text-sm">{invoice.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Mark as Sent */}
                        {invoice.status === 'draft' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => markAsSent(invoice)}
                            title="Mark as Sent"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Mark as Paid */}
                        {(invoice.status === 'sent' || invoice.status === 'partial' || invoice.status === 'overdue') && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-green-600"
                            onClick={() => markAsPaid(invoice)}
                            title="Mark as Paid"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Delete */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteInvoice(invoice.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No invoices found</p>
            <p className="text-sm">Create your first invoice to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
