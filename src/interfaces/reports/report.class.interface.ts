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
