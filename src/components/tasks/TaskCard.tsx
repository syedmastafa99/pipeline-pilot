import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Task, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '@/lib/constants';
import { 
  MoreHorizontal, 
  Calendar, 
  User,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const priority = PRIORITY_OPTIONS.find(p => p.value === task.priority);
  const status = STATUS_OPTIONS.find(s => s.value === task.status);

  const statusIcons = {
    pending: Circle,
    in_progress: Clock,
    completed: CheckCircle2,
    cancelled: XCircle,
  };
  const StatusIcon = statusIcons[task.status];

  const handleStatusChange = (newStatus: Task['status']) => {
    updateTask.mutate({ id: task.id, status: newStatus });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask.mutate(task.id);
    }
  };

  return (
    <Card className="group animate-scale-in transition-all hover:shadow-elegant">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => handleStatusChange(task.status === 'completed' ? 'pending' : 'completed')}
              className={cn(
                'mt-0.5 transition-colors',
                task.status === 'completed' ? 'text-success' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <StatusIcon className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h3 className={cn(
                'font-medium',
                task.status === 'completed' && 'text-muted-foreground line-through'
              )}>
                {task.title}
              </h3>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(task)}>
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {STATUS_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value as Task['status'])}
                  className={task.status === option.value ? 'bg-muted' : ''}
                >
                  Mark as {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={priority?.color}>
            {priority?.label}
          </Badge>
          <Badge variant="outline" className={status?.color}>
            {status?.label}
          </Badge>
          {task.due_date && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {format(new Date(task.due_date), 'MMM d, yyyy')}
            </span>
          )}
          {task.assigned_to && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              {task.assigned_to}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
