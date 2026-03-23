import { RawRecord } from './reports/reports.interface';

export interface GetTokenResponse {
  response: {
    token: string;
  };
}

export interface FindRecordsResult {
  response: {
    data: RawRecord[];
    totalCount: number;
  };
}

export interface RequestUserReport {
  user: {
    nombre: string;
    rol: string;
  };
}
