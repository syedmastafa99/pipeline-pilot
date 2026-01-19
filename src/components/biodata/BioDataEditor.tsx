import { Candidate } from '@/hooks/useCandidates';
import { CustomField } from '@/pages/BioData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface BioDataEditorProps {
  candidate: Candidate;
  customFields: CustomField[];
  onUpdateField: (id: string, field: Partial<CustomField>) => void;
  onRemoveField: (id: string) => void;
  onAddField: () => void;
}

export function BioDataEditor({
  candidate,
  customFields,
  onUpdateField,
  onRemoveField,
  onAddField,
}: BioDataEditorProps) {
  const standardFields = [
    { label: 'Company Name', value: candidate.ref_company },
    { label: 'Trade', value: candidate.job_title },
    { label: 'Full Name', value: candidate.full_name },
    { label: 'Surname', value: candidate.surname },
    { label: 'Given Name', value: candidate.given_name },
    { label: 'Passport Number', value: candidate.passport_number },
    { label: 'Nationality', value: candidate.nationality },
    { label: 'Date of Birth', value: candidate.date_of_birth },
    { label: 'Sex', value: candidate.sex },
    { label: 'Place of Birth', value: candidate.place_of_birth },
    { label: 'Height', value: candidate.height },
    { label: 'Weight', value: candidate.weight },
    { label: 'Certificate', value: candidate.certificate },
    { label: 'Passport Issue Date', value: candidate.passport_issue_date },
    { label: 'Passport Expiry Date', value: candidate.passport_expiry_date },
    { label: 'Issuing Authority', value: candidate.issuing_authority },
    { label: 'Father\'s Name', value: candidate.father_name },
    { label: 'Mother\'s Name', value: candidate.mother_name },
    { label: 'Legal Guardian', value: candidate.legal_guardian_name },
    { label: 'Permanent Address', value: candidate.permanent_address },
    { label: 'Phone', value: candidate.phone },
    { label: 'Email', value: candidate.email },
    { label: 'Destination Country', value: candidate.destination_country },
    { label: 'Employer', value: candidate.employer },
    { label: 'Agent Name', value: candidate.agent_name },
    { label: 'Emergency Contact', value: candidate.emergency_contact_name },
    { label: 'Emergency Contact Relation', value: candidate.emergency_contact_relationship },
    { label: 'Emergency Contact Phone', value: candidate.emergency_contact_phone },
    { label: 'Emergency Contact Address', value: candidate.emergency_contact_address },
  ].filter(f => f.value);

  return (
    <div className="space-y-6">
      {/* Standard Fields from Candidate */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Candidate Information</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {standardFields.map((field, index) => (
            <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <span className="text-xs font-medium text-muted-foreground min-w-[120px]">
                {field.label}:
              </span>
              <span className="text-sm text-foreground truncate">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Custom Fields */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Custom Fields</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddField}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Field
          </Button>
        </div>

        {customFields.length === 0 ? (
          <div className="text-center py-6 border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              No custom fields added yet
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddField}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add your first field
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center h-9 text-muted-foreground cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Field Label</Label>
                    <Input
                      placeholder="e.g., Visa Number"
                      value={field.label}
                      onChange={(e) => onUpdateField(field.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Field Value</Label>
                    <Input
                      placeholder="Enter value..."
                      value={field.value}
                      onChange={(e) => onUpdateField(field.id, { value: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemoveField(field.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
