import { AppLayout } from '@/components/layout/AppLayout';
import { BulkUpload } from '@/components/upload/BulkUpload';
import { BulkPassportScan } from '@/components/upload/BulkPassportScan';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, ScanLine } from 'lucide-react';

export default function Upload() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Bulk Upload</h1>
          <p className="mt-1 text-muted-foreground">
            Import multiple candidates via CSV or passport scans
          </p>
        </div>

        <Tabs defaultValue="passport-scan" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="passport-scan" className="gap-2">
              <ScanLine className="h-4 w-4" />
              Passport Scan
            </TabsTrigger>
            <TabsTrigger value="csv" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV Upload
            </TabsTrigger>
          </TabsList>
          <TabsContent value="passport-scan" className="mt-6">
            <BulkPassportScan />
          </TabsContent>
          <TabsContent value="csv" className="mt-6">
            <BulkUpload />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
