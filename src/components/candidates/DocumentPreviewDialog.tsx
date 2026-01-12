import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
  fileName: string | null;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  filePath,
  fileName,
}: DocumentPreviewDialogProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileExtension = fileName?.split(".").pop()?.toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fileExtension || "");
  const isPdf = fileExtension === "pdf";

  useEffect(() => {
    if (open && filePath) {
      fetchSignedUrl();
    } else {
      setSignedUrl(null);
      setError(null);
    }
  }, [open, filePath]);

  const fetchSignedUrl = async () => {
    if (!filePath) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: urlError } = await supabase.storage
        .from("candidate-documents")
        .createSignedUrl(filePath, 3600);

      if (urlError) throw urlError;
      setSignedUrl(data.signedUrl);
    } catch (err) {
      console.error("Failed to get signed URL:", err);
      setError("Failed to load document preview");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (signedUrl && fileName) {
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = fileName;
      link.click();
    }
  };

  const handleOpenExternal = () => {
    if (signedUrl) {
      window.open(signedUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isImage ? (
              <ImageIcon className="h-5 w-5" />
            ) : (
              <FileText className="h-5 w-5" />
            )}
            {fileName || "Document Preview"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Skeleton className="h-full w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <FileText className="h-16 w-16 mb-4 opacity-50" />
              <p>{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchSignedUrl}>
                Retry
              </Button>
            </div>
          ) : signedUrl ? (
            <div className="flex flex-col h-full">
              {isImage ? (
                <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-lg p-4">
                  <img
                    src={signedUrl}
                    alt={fileName || "Document"}
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                </div>
              ) : isPdf ? (
                <iframe
                  src={signedUrl}
                  className="w-full h-[60vh] rounded-lg border"
                  title={fileName || "PDF Preview"}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-50" />
                  <p>Preview not available for this file type</p>
                  <p className="text-sm mt-1">Click download or open in new tab to view</p>
                </div>
              )}

              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="outline" onClick={handleOpenExternal}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
