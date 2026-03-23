import type { ReportBankRecord } from './report.class.interface';

export interface ResponseBankReport {
  data: ReportBankRecord[];
  meta: {
    totalRecords: number;
    currentPage: number;
    limit: number;
  };
}

export interface RawRecord {
  recordId: string;
  fieldData: Record<string, unknown>;
  portalData: Record<string, unknown>;
}
