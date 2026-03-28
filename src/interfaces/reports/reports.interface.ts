export interface RawRecord {
  recordId: string;
  fieldData: Record<string, unknown>;
  portalData: Record<string, unknown>;
}
export interface FilterModel {
  value: string | number | boolean;
  filterType: string;
  type: string;
  filter: string | number;
}
