export interface ReportBankRecord {
  idRegistro: string;
  fecha: string;
  formaPago: string;
  concepto: string;
  abono: number;
  cargo: number;
  montoIngreso?: number;
  estadoIngreso?: string;
  montoEgreso?: number;
  estadoEgreso?: string;
}

export interface filterBankModel {
  filterType: string | undefined;
  fecha?: string;
  formaPago?: string;
  concepto?: string;
  abono?: number;
  cargo?: number;
}
