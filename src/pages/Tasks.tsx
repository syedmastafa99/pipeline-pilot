import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCard } from '@/components/tasks/TaskCard';
import { AddTaskDialog } from '@/components/tasks/AddTaskDialog';
import { useTasks, Task } from '@/hooks/useTasks';
import { Search, ClipboardList } from 'lucide-react';

type TaskFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || task.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getTaskCount = (status: TaskFilter) => {
    if (status === 'all') return tasks.length;
    return tasks.filter(t => t.status === status).length;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Tasks</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your agency tasks and to-dos
            </p>
          </div>
          <AddTaskDialog />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as TaskFilter)}>
          <TabsList>
            <TabsTrigger value="all">All ({getTaskCount('all')})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getTaskCount('pending')})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({getTaskCount('in_progress')})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({getTaskCount('completed')})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeFilter} className="mt-6">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 py-16">
                <ClipboardList className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 font-medium text-muted-foreground">No tasks found</p>
                <p className="mt-1 text-sm text-muted-foreground/70">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first task to get started'}
                </p>
                {!searchQuery && (
                  <div className="mt-4">
                    <AddTaskDialog />
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
