import { useRef, useState } from "react";
import { useCandidateDocuments, useToggleDocument, useUploadDocument, useDeleteDocument, useGetSignedUrl } from "@/hooks/useDocumentChecklist";
import { DocumentPreviewDialog } from "./DocumentPreviewDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileCheck, FileX, AlertCircle, Upload, Paperclip, Download, Trash2, Loader2, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DocumentChecklistProps {
  candidateId: string;
  stage: string;
}

export function DocumentChecklist({ candidateId, stage }: DocumentChecklistProps) {
  const { data: documents, isLoading } = useCandidateDocuments(candidateId, stage);
  const toggleDocument = useToggleDocument();
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const getSignedUrl = useGetSignedUrl();
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ path: string; name: string } | null>(null);

  const handlePreview = (filePath: string, fileName: string) => {
    setPreviewFile({ path: filePath, name: fileName });
    setPreviewOpen(true);
  };

  const handleToggle = (
    stageDocumentId: string,
    candidateDocumentId: string | null,
    currentState: boolean
  ) => {
    toggleDocument.mutate({
      candidateId,
      stageDocumentId,
      isCompleted: !currentState,
      candidateDocumentId,
    });
  };

  const handleFileUpload = async (
    stageDocumentId: string,
    candidateDocumentId: string | null,
    file: File
  ) => {
    try {
      await uploadDocument.mutateAsync({
        candidateId,
        stageDocumentId,
        candidateDocumentId,
        file,
      });
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
      console.error(error);
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const signedUrl = await getSignedUrl.mutateAsync(filePath);
      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = fileName;
      link.click();
    } catch (error) {
      toast.error("Failed to download file");
      console.error(error);
    }
  };

  const handleDeleteFile = async (candidateDocumentId: string, filePath: string) => {
    try {
      await deleteDocument.mutateAsync({ candidateDocumentId, filePath });
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground py-4">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">No documents required for this stage</span>
      </div>
    );
  }

  const completedCount = documents.filter((d) => d.is_completed).length;
  const requiredCount = documents.filter((d) => d.is_required).length;
  const completedRequired = documents.filter((d) => d.is_required && d.is_completed).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completedRequired === requiredCount ? (
            <FileCheck className="h-5 w-5 text-success" />
          ) : (
            <FileX className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {completedCount} of {documents.length} documents completed
          </span>
        </div>
        {completedRequired === requiredCount && requiredCount > 0 && (
          <Badge variant="default" className="bg-success text-success-foreground">
            All Required Complete
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            onToggle={handleToggle}
            onUpload={handleFileUpload}
            onDownload={handleDownload}
            onDelete={handleDeleteFile}
            onPreview={handlePreview}
            isUploading={uploadDocument.isPending}
            isDeleting={deleteDocument.isPending}
          />
        ))}
      </div>

      <DocumentPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        filePath={previewFile?.path || null}
        fileName={previewFile?.name || null}
      />
    </div>
  );
}

interface DocumentItemProps {
  doc: {
    id: string;
    document_name: string;
    description: string | null;
    is_required: boolean;
    is_completed: boolean;
    completed_at: string | null;
    candidate_document_id: string | null;
    file_url: string | null;
    file_name: string | null;
  };
  onToggle: (stageDocumentId: string, candidateDocumentId: string | null, currentState: boolean) => void;
  onUpload: (stageDocumentId: string, candidateDocumentId: string | null, file: File) => void;
  onDownload: (filePath: string, fileName: string) => void;
  onDelete: (candidateDocumentId: string, filePath: string) => void;
  onPreview: (filePath: string, fileName: string) => void;
  isUploading: boolean;
  isDeleting: boolean;
}

function DocumentItem({ doc, onToggle, onUpload, onDownload, onDelete, onPreview, isUploading, isDeleting }: DocumentItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(doc.id, doc.candidate_document_id, file);
      e.target.value = "";
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        doc.is_completed
          ? "bg-success/5 border-success/20"
          : "bg-card border-border hover:border-primary/30"
      }`}
    >
      <Checkbox
        checked={doc.is_completed}
        onCheckedChange={() =>
          onToggle(doc.id, doc.candidate_document_id, doc.is_completed)
        }
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              doc.is_completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {doc.document_name}
          </span>
          {doc.is_required && (
            <Badge variant="outline" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        {doc.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {doc.description}
          </p>
        )}
        {doc.is_completed && doc.completed_at && (
          <p className="text-xs text-success mt-1">
            Completed {format(new Date(doc.completed_at), "MMM d, yyyy")}
          </p>
        )}

        {/* File attachment section */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {doc.file_url && doc.file_name ? (
            <div className="flex items-center gap-2 bg-muted/50 rounded px-2 py-1">
              <Paperclip className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs truncate max-w-[150px]">{doc.file_name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onPreview(doc.file_url!, doc.file_name!)}
                title="Preview"
              >
                <Eye className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => onDownload(doc.file_url!, doc.file_name!)}
                title="Download"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive"
                onClick={() => onDelete(doc.candidate_document_id!, doc.file_url!)}
                disabled={isDeleting}
                title="Delete file"
              >
                {isDeleting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}
              </Button>
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Upload className="h-3 w-3 mr-1" />
                )}
                Attach File
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
