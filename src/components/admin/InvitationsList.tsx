import { format, isPast } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { useInvitations } from '@/hooks/useInvitations';
import { Skeleton } from '@/components/ui/skeleton';

export function InvitationsList() {
  const { invitations, isLoading, cancelInvitation, resendInvitation } = useInvitations();

  const getStatusBadge = (status: string, expiresAt: string) => {
    if (status === 'pending' && isPast(new Date(expiresAt))) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20">Accepted</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-primary/10 text-primary">Admin</Badge>;
      case 'user':
        return <Badge variant="secondary">User</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No invitations sent yet. Click "Invite Team Member" to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.email}</TableCell>
              <TableCell>{getRoleBadge(invitation.role)}</TableCell>
              <TableCell>{getStatusBadge(invitation.status, invitation.expires_at)}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(invitation.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {invitation.status === 'pending' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => resendInvitation.mutate({
                          id: invitation.id,
                          email: invitation.email,
                          role: invitation.role,
                        })}
                        disabled={resendInvitation.isPending}
                      >
                        {resendInvitation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Resend
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => cancelInvitation.mutate(invitation.id)}
                        disabled={cancelInvitation.isPending}
                        className="text-destructive"
                      >
                        {cancelInvitation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
