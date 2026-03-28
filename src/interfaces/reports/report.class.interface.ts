import { FilterModel } from './reports.interface';

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
export interface FilterBankModel {
  fecha?: FilterModel;
  formaPago?: FilterModel;
  concepto?: FilterModel;
  abono?: FilterModel;
  cargo?: FilterModel;
  estadoIngreso?: FilterModel;
  estadoEgreso?: FilterModel;
}
