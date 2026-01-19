import { useRef, useState } from 'react';
import { Candidate } from '@/hooks/useCandidates';
import { CustomField } from '@/pages/BioData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BioDataPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  customFields: CustomField[];
}

export function BioDataPreview({
  open,
  onOpenChange,
  candidate,
  customFields,
}: BioDataPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bio Data - ${candidate.full_name}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #000;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 28px;
              margin: 0 0 5px 0;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .header p {
              margin: 0;
              color: #666;
            }
            .photo-section {
              float: right;
              width: 120px;
              height: 150px;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 20px;
              margin-bottom: 10px;
            }
            .photo-section img {
              max-width: 100%;
              max-height: 100%;
              object-fit: cover;
            }
            .section {
              margin-bottom: 25px;
              clear: both;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              border-bottom: 1px solid #333;
              padding-bottom: 5px;
              margin-bottom: 15px;
              color: #333;
            }
            .field-row {
              display: flex;
              margin-bottom: 8px;
              font-size: 13px;
            }
            .field-label {
              width: 200px;
              font-weight: bold;
              color: #444;
            }
            .field-value {
              flex: 1;
              border-bottom: 1px dotted #999;
              padding-left: 10px;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            @media print {
              body { padding: 20px; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownload = async () => {
    const printContent = printRef.current;
    if (!printContent) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`BioData_${candidate.full_name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  const personalFields = [
    { label: 'Full Name', value: candidate.full_name },
    { label: 'Surname', value: candidate.surname },
    { label: 'Given Name', value: candidate.given_name },
    { label: 'Date of Birth', value: formatDate(candidate.date_of_birth) },
    { label: 'Sex', value: candidate.sex },
    { label: 'Place of Birth', value: candidate.place_of_birth },
    { label: 'Nationality', value: candidate.nationality },
    { label: 'Height', value: candidate.height },
    { label: 'Weight', value: candidate.weight },
    { label: 'Certificate', value: candidate.certificate },
    { label: "Father's Name", value: candidate.father_name },
    { label: "Mother's Name", value: candidate.mother_name },
    { label: 'Legal Guardian', value: candidate.legal_guardian_name },
  ].filter(f => f.value);

  const passportFields = [
    { label: 'Passport Number', value: candidate.passport_number },
    { label: 'Issue Date', value: formatDate(candidate.passport_issue_date) },
    { label: 'Expiry Date', value: formatDate(candidate.passport_expiry_date) },
    { label: 'Issuing Authority', value: candidate.issuing_authority },
    { label: 'Personal Number', value: candidate.personal_number },
  ].filter(f => f.value);

  const contactFields = [
    { label: 'Permanent Address', value: candidate.permanent_address },
    { label: 'Phone', value: candidate.phone },
    { label: 'Email', value: candidate.email },
  ].filter(f => f.value);

  const employmentFields = [
    { label: 'Company Name', value: candidate.ref_company },
    { label: 'Trade', value: candidate.job_title },
    { label: 'Destination Country', value: candidate.destination_country },
    { label: 'Employer', value: candidate.employer },
    { label: 'Agent Name', value: candidate.agent_name },
  ].filter(f => f.value);

  const emergencyFields = [
    { label: 'Contact Name', value: candidate.emergency_contact_name },
    { label: 'Relationship', value: candidate.emergency_contact_relationship },
    { label: 'Phone', value: candidate.emergency_contact_phone },
    { label: 'Address', value: candidate.emergency_contact_address },
  ].filter(f => f.value);

  const validCustomFields = customFields.filter(f => f.label && f.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Bio Data Preview</DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-1" />
                )}
                {isDownloading ? 'Generating...' : 'Download'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div 
          ref={printRef}
          className="bg-white text-black p-8 rounded-lg border"
          style={{ fontFamily: "'Times New Roman', serif" }}
        >
          {/* Header with Company Name and Trade beside photo */}
          <div className="header text-center border-b-2 border-black pb-5 mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wide m-0">
              Bio Data
            </h1>
            <p className="text-gray-600 m-0 mt-1">
              Personal Information Document
            </p>
          </div>

          {/* Top section with Photo and Company/Trade info */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1 pr-4">
              {candidate.ref_company && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Company Name
                  </span>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {candidate.ref_company}
                  </p>
                </div>
              )}
              {candidate.job_title && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Trade
                  </span>
                  <p className="text-xl font-bold text-gray-800 mt-1">
                    {candidate.job_title}
                  </p>
                </div>
              )}
            </div>
            {/* Photo placeholder */}
            <div className="w-[120px] h-[150px] border border-gray-300 flex items-center justify-center flex-shrink-0">
              {candidate.passport_scan_url ? (
                <img 
                  src={candidate.passport_scan_url} 
                  alt="Photo"
                  className="max-w-full max-h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400">Photo</span>
              )}
            </div>
          </div>

          {/* Personal Information */}
          {personalFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Personal Information
              </div>
              {personalFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Passport Details */}
          {passportFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Passport Details
              </div>
              {passportFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Contact Information */}
          {contactFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Contact Information
              </div>
              {contactFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Employment Details */}
          {employmentFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Employment Details
              </div>
              {employmentFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Emergency Contact */}
          {emergencyFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Emergency Contact
              </div>
              {emergencyFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Custom Fields */}
          {validCustomFields.length > 0 && (
            <div className="section mb-6">
              <div className="section-title text-sm font-bold uppercase border-b border-gray-800 pb-1 mb-4">
                Additional Information
              </div>
              {validCustomFields.map((field, i) => (
                <div key={i} className="field-row flex mb-2 text-sm">
                  <span className="field-label w-[200px] font-semibold text-gray-700">
                    {field.label}:
                  </span>
                  <span className="field-value flex-1 border-b border-dotted border-gray-400 pl-2">
                    {field.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="footer mt-12 pt-5 border-t border-gray-300 text-center text-xs text-gray-600">
            <p>Generated on {format(new Date(), 'dd MMMM yyyy')}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
