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

export interface FilterModel {
  value: any;
  filterType: string;
  type: string;
  filter: string | number;
}

export interface FilterBankModel {
  fecha?: FilterModel;
  formaPago?: FilterModel;
  concepto?: FilterModel;
  abono?: FilterModel;
  cargo?: FilterModel;
  estadoIngreso?: FilterModel;
  estadoEgreso?: FilterModel;
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
