import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Check, X, Trash2, User, Clock, Mail } from "lucide-react";
import { format } from "date-fns";
import type { UserProfile } from "@/hooks/useAdminUsers";

interface UserCardProps {
  user: UserProfile;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string, reason?: string) => void;
  onDelete?: (userId: string) => void;
  showApprove?: boolean;
  showReject?: boolean;
  showDelete?: boolean;
  isLoading?: boolean;
}

export function UserCard({
  user,
  onApprove,
  onReject,
  onDelete,
  showApprove = false,
  showReject = false,
  showDelete = false,
  isLoading = false,
}: UserCardProps) {
  const [rejectReason, setRejectReason] = useState("");

  const getStatusBadge = () => {
    switch (user.status) {
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-foreground truncate">
                  {user.email || "No email"}
                </span>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {format(new Date(user.created_at), "MMM d, yyyy")}
                </span>
              </div>
              {user.rejection_reason && (
                <p className="text-xs text-destructive mt-2">
                  Reason: {user.rejection_reason}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {showApprove && onApprove && (
              <Button
                size="sm"
                variant="default"
                className="gap-1"
                onClick={() => onApprove(user.id)}
                disabled={isLoading}
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
            )}

            {showReject && onReject && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive hover:text-destructive"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject this user? You can optionally provide a reason.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    placeholder="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRejectReason("")}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        onReject(user.id, rejectReason);
                        setRejectReason("");
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Reject
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {showDelete && onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this user? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(user.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
