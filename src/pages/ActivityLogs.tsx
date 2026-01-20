import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { History, Search, Filter, RotateCcw, User, Calendar, FileText } from 'lucide-react';
import { Loader2 } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  update: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  delete: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const TABLE_LABELS: Record<string, string> = {
  candidates: 'Candidates',
  agency_tasks: 'Tasks',
  transactions: 'Transactions',
  invoices: 'Invoices',
  daily_reports: 'Reports',
  stage_history: 'Stage History',
};

export default function ActivityLogs() {
  const { data: logs, isLoading } = useActivityLogs();
  
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [tableFilter, setTableFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique values for filters
  const uniqueUsers = useMemo(() => {
    if (!logs) return [];
    const users = [...new Set(logs.map(log => log.user_email))];
    return users.sort();
  }, [logs]);

  const uniqueTables = useMemo(() => {
    if (!logs) return [];
    const tables = [...new Set(logs.map(log => log.table_name))];
    return tables.sort();
  }, [logs]);

  const uniqueActions = useMemo(() => {
    if (!logs) return [];
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  }, [logs]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    
    return logs.filter(log => {
      // User filter
      if (userFilter !== 'all' && log.user_email !== userFilter) return false;
      
      // Action filter
      if (actionFilter !== 'all' && log.action !== actionFilter) return false;
      
      // Table filter
      if (tableFilter !== 'all' && log.table_name !== tableFilter) return false;
      
      // Date range filter
      if (startDate || endDate) {
        const logDate = parseISO(log.created_at);
        const start = startDate ? startOfDay(parseISO(startDate)) : new Date(0);
        const end = endDate ? endOfDay(parseISO(endDate)) : new Date();
        
        if (!isWithinInterval(logDate, { start, end })) return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesEmail = log.user_email.toLowerCase().includes(query);
        const matchesDescription = log.description?.toLowerCase().includes(query);
        const matchesTable = log.table_name.toLowerCase().includes(query);
        const matchesAction = log.action.toLowerCase().includes(query);
        
        if (!matchesEmail && !matchesDescription && !matchesTable && !matchesAction) {
          return false;
        }
      }
      
      return true;
    });
  }, [logs, userFilter, actionFilter, tableFilter, startDate, endDate, searchQuery]);

  const handleResetFilters = () => {
    setUserFilter('all');
    setActionFilter('all');
    setTableFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const formatDataChange = (oldData: unknown, newData: unknown) => {
    if (!oldData && !newData) return '-';
    
    if (!oldData && newData) {
      return 'New record created';
    }
    
    if (oldData && !newData) {
      return 'Record deleted';
    }
    
    // Show changed fields
    const oldObj = oldData as Record<string, unknown>;
    const newObj = newData as Record<string, unknown>;
    const changes: string[] = [];
    
    Object.keys(newObj).forEach(key => {
      if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
        changes.push(key);
      }
    });
    
    if (changes.length === 0) return 'No changes detected';
    if (changes.length <= 3) return `Changed: ${changes.join(', ')}`;
    return `Changed ${changes.length} fields`;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Activity Logs
            </h1>
            <p className="text-sm text-muted-foreground">
              Track all user actions and data changes
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {/* Search */}
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* User Filter */}
              <div className="space-y-2">
                <Label>User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Action Filter */}
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    {uniqueActions.map(action => (
                      <SelectItem key={action} value={action}>
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Table Filter */}
              <div className="space-y-2">
                <Label>Table</Label>
                <Select value={tableFilter} onValueChange={setTableFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All tables</SelectItem>
                    {uniqueTables.map(table => (
                      <SelectItem key={table} value={table}>
                        {TABLE_LABELS[table] || table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="w-full gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">From Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">To Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
                <p className="text-sm text-muted-foreground">Total Logs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.action === 'create').length}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.action === 'update').length}
                </p>
                <p className="text-sm text-muted-foreground">Updated</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900">
                <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {filteredLogs.filter(l => l.action === 'delete').length}
                </p>
                <p className="text-sm text-muted-foreground">Deleted</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <History className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No activity logs found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {logs?.length === 0
                    ? 'Activity will appear here when users make changes'
                    : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(parseISO(log.created_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="max-w-[200px] truncate text-sm">
                              {log.user_email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary"
                            className={ACTION_COLORS[log.action] || ''}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {TABLE_LABELS[log.table_name] || log.table_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="truncate text-sm text-muted-foreground">
                            {log.description || '-'}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <p className="truncate text-sm text-muted-foreground">
                            {formatDataChange(log.old_data, log.new_data)}
                          </p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
