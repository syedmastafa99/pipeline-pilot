import { useCandidateDocuments, useToggleDocument } from "@/hooks/useDocumentChecklist";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCheck, FileX, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface DocumentChecklistProps {
  candidateId: string;
  stage: string;
}

export function DocumentChecklist({ candidateId, stage }: DocumentChecklistProps) {
  const { data: documents, isLoading } = useCandidateDocuments(candidateId, stage);
  const toggleDocument = useToggleDocument();

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
          <div
            key={doc.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
              doc.is_completed
                ? "bg-success/5 border-success/20"
                : "bg-card border-border hover:border-primary/30"
            }`}
          >
            <Checkbox
              checked={doc.is_completed}
              onCheckedChange={() =>
                handleToggle(doc.id, doc.candidate_document_id, doc.is_completed)
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
