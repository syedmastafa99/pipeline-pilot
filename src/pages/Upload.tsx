import { AppLayout } from '@/components/layout/AppLayout';
import { BulkUpload } from '@/components/upload/BulkUpload';

export default function Upload() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Bulk Upload</h1>
          <p className="mt-1 text-muted-foreground">
            Import multiple candidates from a CSV file
          </p>
        </div>

        <BulkUpload />
      </div>
    </AppLayout>
  );
}
