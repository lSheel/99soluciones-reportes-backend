import { Injectable } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { FileMakerService } from '../filemaker/filemaker.service';
import type { FindRecordsResult } from '../interfaces/filemaker.interface';
import { RawRecord } from '../interfaces/reports/reports.interface';
import { FilterModel } from '../../dist/interfaces/reports/reports.interface';

type DateRange = { startDate: string; endDate: string };
type FileMakerCondition = Record<string, string | number>;

export interface PaginatedResponse<TRecord> {
  data: TRecord[];
  meta: {
    totalRecords: number;
    currentPage: number;
    limit: number;
  };
}

export interface ReportConfig<TFilterModel extends object, TRecord> {
  layoutName: string;
  cachePrefix: string;
  dataField: string;
  fieldMapping: Partial<Record<Extract<keyof TFilterModel, string>, string>>;
  globalSearchFields: string[];
  cleanDataFunction: (rawData: RawRecord[]) => TRecord[];
}

@Injectable()
export abstract class BaseReportService<TFilterModel extends object, TRecord> {
  protected readonly fileMakerService: FileMakerService;
  protected readonly cacheManager: Cache;
  protected readonly config: ReportConfig<TFilterModel, TRecord>;

  constructor(
    fileMakerService: FileMakerService,
    cacheManager: Cache,
    config: ReportConfig<TFilterModel, TRecord>,
  ) {
    this.fileMakerService = fileMakerService;
    this.cacheManager = cacheManager;
    this.config = config;
  }

  // Cambio clave: contrato de salida fuertemente tipado para eliminar casts inseguros.
  async fetchFromFileMakerWithFilters(
    offSet: number,
    limit: number,
    globalSearch: string,
    filterModel: TFilterModel,
    dateRange: DateRange,
  ): Promise<PaginatedResponse<TRecord>> {
    const cacheKey = `${this.config.layoutName}_${offSet}_${limit}_${globalSearch}_${JSON.stringify(filterModel)}_${JSON.stringify(dateRange)}`;
    const cacheData =
      await this.cacheManager.get<PaginatedResponse<TRecord>>(cacheKey);

    if (cacheData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cacheData;
    }

    const fmQuery = this.makeFilterString(globalSearch, filterModel, dateRange);

    const fmResponse: FindRecordsResult =
      await this.fileMakerService.findRecords(
        this.config.layoutName,
        fmQuery,
        offSet + 1,
        limit,
      );

    console.log(fmResponse);

    const rawData = fmResponse.response.data;

    if (!rawData || rawData.length === 0) {
      return {
        data: [],
        meta: {
          totalRecords: 0,
          currentPage: 0,
          limit: 0,
        },
      };
    }

    const cleanData = this.config.cleanDataFunction(rawData);

    const response: PaginatedResponse<TRecord> = {
      data: cleanData,
      meta: {
        totalRecords: fmResponse.response.data.length,
        currentPage: Math.floor(offSet / limit) + 1,
        limit: Math.ceil(fmResponse.response.data.length / limit),
      },
    };

    await this.cacheManager.set(cacheKey, response);
    return response;
  }

  private makeFilterString(
    globalSearch: string,
    filterModel: TFilterModel,
    dateRange: DateRange,
  ) {
    const baseConditions: FileMakerCondition = {};

    let formatDate: (dateISO: string) => string = () => '';

    if (dateRange.startDate && dateRange.endDate) {
      formatDate = (dateISO: string) => {
        if (!dateISO) return '';
        const [year, month, day] = dateISO.split('-');
        return `${month}/${day}/${year}`;
      };
    }

    const fmStartDate = formatDate(dateRange.startDate);
    const fmEndDate = formatDate(dateRange.endDate);

    if (fmStartDate && fmEndDate)
      baseConditions[this.config.dataField] = `${fmStartDate}...${fmEndDate}`;

    if (filterModel && Object.keys(filterModel).length > 0) {
      Object.entries(filterModel as Record<string, unknown>).forEach(
        ([key, filterInfo]) => {
          const typedKey = key as Extract<keyof TFilterModel, string>;
          const fmField = this.config.fieldMapping[typedKey];
          if (fmField) {
            if (!filterInfo) return;
            const typedFilterInfo = filterInfo as FilterModel;
            if (typedFilterInfo.filterType === 'text') {
              baseConditions[fmField] = typedFilterInfo.filter;
            } else if (typedFilterInfo.filterType === 'number') {
              if (typedFilterInfo.type === 'greaterThan')
                baseConditions[fmField] = `>${typedFilterInfo.filter}`;
              else if (typedFilterInfo.type === 'lessThan')
                baseConditions[fmField] = `<${typedFilterInfo.filter}`;
              else if (typedFilterInfo.type === 'equals')
                baseConditions[fmField] = `=${typedFilterInfo.filter}`;
            }
          }
        },
      );
    }

    const finalQuery: FileMakerCondition[] = [];

    if (globalSearch && globalSearch.trim() !== '') {
      this.config.globalSearchFields.forEach((field) => {
        finalQuery.push({
          ...baseConditions,
          [field]: `*${globalSearch}*`,
        });
      });
    } else {
      finalQuery.push(baseConditions);
    }

    if (finalQuery.length === 0 || Object.keys(finalQuery[0]).length === 0)
      return [{}];
    return finalQuery;
  }
}
