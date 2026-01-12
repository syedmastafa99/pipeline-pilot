import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email: string | null;
  is_approved: boolean;
  status: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

async function sendNotificationEmail(email: string, type: "approved" | "rejected", reason?: string) {
  try {
    const { data, error } = await supabase.functions.invoke("send-user-notification", {
      body: { email, type, reason },
    });
    
    if (error) {
      console.error("Failed to send notification email:", error);
    }
    return data;
  } catch (err) {
    console.error("Error invoking notification function:", err);
  }
}

export function useAllUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ["admin-pending-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function useApprovedUsers() {
  return useQuery({
    queryKey: ["admin-approved-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function useRejectedUsers() {
  return useQuery({
    queryKey: ["admin-rejected-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "rejected")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserProfile[];
    },
  });
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_approved: true, 
          status: "approved",
          rejection_reason: null 
        })
        .eq("id", userId);

      if (error) throw error;

      // Send notification email
      if (email) {
        await sendNotificationEmail(email, "approved");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-approved-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-rejected-users"] });
    },
  });
}

export function useRejectUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, email, reason }: { userId: string; email: string | null; reason?: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_approved: false, 
          status: "rejected",
          rejection_reason: reason || null 
        })
        .eq("id", userId);

      if (error) throw error;

      // Send notification email
      if (email) {
        await sendNotificationEmail(email, "rejected", reason);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-approved-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-rejected-users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-approved-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-rejected-users"] });
    },
  });
}
