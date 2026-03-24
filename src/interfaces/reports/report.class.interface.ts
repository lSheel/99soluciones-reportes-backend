export interface ReportBankRecord {
  idRegistro: string;
  fecha: string;
  formaPago: string;
  concepto: string;
  abono: number;
  cargo: number;
  estadoIngreso?: string;
  estadoEgreso?: string;
}

export interface filterModel {
  value: any;
  filterType: string;
  type: string;
  filter: string | number;
}

export interface filterBankModel {
  fecha?: filterModel;
  formaPago?: filterModel;
  concepto?: filterModel;
  abono?: filterModel;
  cargo?: filterModel;
  estadoIngreso?: filterModel;
  estadoEgreso?: filterModel;
}

export interface QueryBankReport {
  fecha?: string;
  formaPago?: string;
  concepto?: string;
  abono?: number;
  cargo?: number;
  estadoEgreso?: string;
  estadoIngreso?: string;
}

export interface FinalQueryBankReport extends QueryBankReport {
  [key: string]: string | number | undefined;
}
