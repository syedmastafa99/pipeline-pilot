import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "@/components/admin/UserCard";
import { 
  usePendingUsers, 
  useApprovedUsers, 
  useRejectedUsers,
  useApproveUser,
  useRejectUser,
  useDeleteUser,
} from "@/hooks/useAdminUsers";
import { toast } from "sonner";
import { Users, UserCheck, UserX, Clock } from "lucide-react";

export default function Admin() {
  const { data: pendingUsers, isLoading: loadingPending } = usePendingUsers();
  const { data: approvedUsers, isLoading: loadingApproved } = useApprovedUsers();
  const { data: rejectedUsers, isLoading: loadingRejected } = useRejectedUsers();
  
  const approveUser = useApproveUser();
  const rejectUser = useRejectUser();
  const deleteUser = useDeleteUser();

  const handleApprove = async (userId: string, email: string | null) => {
    try {
      await approveUser.mutateAsync({ userId, email });
      toast.success("User approved successfully");
    } catch (error) {
      toast.error("Failed to approve user");
    }
  };

  const handleReject = async (userId: string, email: string | null, reason?: string) => {
    try {
      await rejectUser.mutateAsync({ userId, email, reason });
      toast.success("User rejected");
    } catch (error) {
      toast.error("Failed to reject user");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser.mutateAsync(userId);
      toast.success("User deleted");
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const renderSkeletons = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user approvals and access
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingUsers?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedUsers?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Approved Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rejectedUsers?.length ?? 0}</p>
                  <p className="text-sm text-muted-foreground">Rejected Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for user management */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <UserX className="h-4 w-4" />
              Rejected
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>
                  Users waiting for approval to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPending ? (
                  renderSkeletons()
                ) : pendingUsers && pendingUsers.length > 0 ? (
                  <div className="space-y-3">
                    {pendingUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        showApprove
                        showReject
                        isLoading={approveUser.isPending || rejectUser.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No pending approvals
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Users</CardTitle>
                <CardDescription>
                  Users with active access to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingApproved ? (
                  renderSkeletons()
                ) : approvedUsers && approvedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {approvedUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onReject={handleReject}
                        onDelete={handleDelete}
                        showReject
                        showDelete
                        isLoading={rejectUser.isPending || deleteUser.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No approved users
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Users</CardTitle>
                <CardDescription>
                  Users whose access was denied
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRejected ? (
                  renderSkeletons()
                ) : rejectedUsers && rejectedUsers.length > 0 ? (
                  <div className="space-y-3">
                    {rejectedUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onApprove={handleApprove}
                        onDelete={handleDelete}
                        showApprove
                        showDelete
                        isLoading={approveUser.isPending || deleteUser.isPending}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No rejected users
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
