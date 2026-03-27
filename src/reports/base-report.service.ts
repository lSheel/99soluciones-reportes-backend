import { Injectable } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { FileMakerService } from '../filemaker/filemaker.service';
import type { FindRecordsResult } from '../interfaces/filemaker.interface';
import { RawRecord } from '../interfaces/reports/reports.interface';
import { FilterModel } from '../interfaces/reports/report.class.interface';

export interface ReportConfig<T, U, V> {
  layoutName: string;
  cachePrefix: string;
  dataField: string;
  filterModel: U;
  fieldMapping: Record<string, string>;
  globalSearchFields: string[];
  cleanDataFunction: (rawData: RawRecord[]) => V[];
  responsetype?: T;
}

@Injectable()
export abstract class BaseReportService<T, U, V> {
  protected readonly fileMakerService: FileMakerService;
  protected readonly cacheManager: Cache;
  protected readonly config: ReportConfig<T, U, V>;

  constructor(
    fileMakerService: FileMakerService,
    cacheManager: Cache,
    config: ReportConfig<T, U, V>,
  ) {
    this.fileMakerService = fileMakerService;
    this.cacheManager = cacheManager;
    this.config = config;
  }

  async fectFromFileMakerWithFilters(
    offSet: number,
    limit: number,
    globalSearch: string,
    filterModel: U,
    dateRange: { startDate: string; endDate: string },
  ): Promise<T> {
    const cacheKey = `${this.config.layoutName}_${offSet}_${limit}_${globalSearch}_${JSON.stringify(filterModel)}_${JSON.stringify(dateRange)}`;
    const cacheData = await this.cacheManager.get<T>(cacheKey);

    if (cacheData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cacheData;
    }

    const fmQuery = this.makeFilterString(globalSearch, filterModel, dateRange);

    const fmResponse: FindRecordsResult =
      await this.fileMakerService.findRecords(
        this.config.layoutName,
        fmQuery,
        offSet + 1, // FileMaker usa 1-based index
        limit,
      );

    console.log(fmResponse);

    const rawData = fmResponse.response.data;

    if (rawData.length === 0 || !rawData) {
      return {
        data: [],
        meta: {
          totalRecord: 0,
          currentPage: 0,
          limit: 0,
        },
      } as unknown as T;
    }

    const cleanData = this.config.cleanDataFunction(rawData);

    const response = {
      data: cleanData,
      meta: {
        totalRecord: fmResponse.response.data.length,
        currentPage: Math.floor(offSet / limit) + 1,
        limit: Math.ceil(fmResponse.response.data.length / limit),
      },
    };

    await this.cacheManager.set(cacheKey, response);
    return response as unknown as T;
  }

  private makeFilterString(
    globalSearch: string,
    filterModel: U,
    dateRange: { startDate: string; endDate: string },
  ) {
    const baseConditions: Record<string, any> = {};

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
      baseConditions[this.config.dataField] =
        `>=${fmStartDate}...<=${fmEndDate}`;

    if (filterModel && Object.keys(filterModel).length > 0) {
      Object.keys(filterModel).forEach((key) => {
        const fmField: string | undefined = this.config.fieldMapping[key];
        if (fmField) {
          const filterInfo: FilterModel = filterModel[
            key as keyof U
          ] as FilterModel;
          if (filterInfo.filterType === 'text') {
            baseConditions[fmField] = filterInfo.filter;
          } else if (filterInfo.filterType === 'number') {
            if (filterInfo.type === 'greaterThan')
              baseConditions[fmField] = `>${filterInfo.filter}`;
            else if (filterInfo.type === 'lessThan')
              baseConditions[fmField] = `<${filterInfo.filter}`;
            else if (filterInfo.type === 'equals')
              baseConditions[fmField] = `=${filterInfo.filter}`;
          }
        }
      });
    }

    const finalQuery: Record<string, any>[] = [];

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
