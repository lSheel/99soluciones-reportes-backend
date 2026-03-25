import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FileMakerService } from '../filemaker/filemaker.service';
import { cleanData } from './banks/banks.mapper';
import type { FindRecordsResult } from '../interfaces/filemaker.interface';
import type {
  filterBankModel,
  filterModel,
  FinalQueryBankReport,
} from '../interfaces/reports/report.class.interface';
import { ResponseBankReport } from '../interfaces/reports/reports.interface';

@Injectable()
export class ReportService {
  constructor(
    private readonly fmService: FileMakerService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async fecthFromFileMaker(offSet: number, limit: number) {
    const filtros = [{ _fecha: '01/01/2024...02/28/2024' }] as any[];

    const fmResponse: FindRecordsResult = await this.fmService.findRecords(
      'ReporteBancos',
      filtros,
      offSet + 1, // FileMaker usa 1-based index
      limit,
    );

    const rawData = fmResponse.response.data;
    const cleanedData = cleanData(rawData);

    return {
      data: cleanedData,
      meta: {
        totalRecords: fmResponse.response.data.length,
        currentPage: Math.floor(offSet / limit) + 1,
        limit: Math.ceil(fmResponse.response.data.length / limit),
      },
    };
  }
  async fecthFromFileMakerWithFilters(
    offSet: number,
    limit: number,
    globalSearch: string,
    filterModel: filterBankModel[],
    dateRange: { startDate: string; endDate: string },
  ): Promise<ResponseBankReport> {
    const cacheKey = `bancos_${offSet}_${limit}_${globalSearch}_${JSON.stringify(filterModel)}_${JSON.stringify(dateRange)}`;
    const cachedData =
      await this.cacheManager.get<ResponseBankReport>(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cachedData;
    }

    const fmQuery = this.makeFilterString(globalSearch, filterModel, dateRange);

    const fmResponse: FindRecordsResult = await this.fmService.findRecords(
      'ReporteBancos',
      fmQuery,
      offSet + 1, // FileMaker usa 1-based index
      limit,
    );
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

    const cleanedData = cleanData(rawData);

    const response = {
      data: cleanedData,
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
    filterModel: filterBankModel[],
    dateRange: { startDate: string; endDate: string },
  ): FinalQueryBankReport[] {
    const fieldMapping = {
      fecha: 'contBanco.ITM::_fecha',
      formaPago: 'contBanco.ITM::_idu_formaPago_v0_22_1',
      concepto: 'contBanco.ITM::mConceptoDeBancoTexto_v0_20_0',
      abono: 'monto_ORIG_abono_v0_22_1',
      cargo: 'monto_ORIG_cargo_v0_22_1',
    };

    const baseConditions: FinalQueryBankReport = {};

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
      baseConditions['contBanco.ITM::_fecha'] = `${fmStartDate}...${fmEndDate}`;

    if (filterModel && Object.keys(filterModel).length > 0) {
      Object.keys(filterModel).forEach((key) => {
        const fmField: string | undefined =
          fieldMapping[key as keyof typeof fieldMapping];
        if (fmField) {
          const filterInfo: filterModel = filterModel[
            key as keyof filterBankModel
          ] as filterModel;
          if (filterInfo.filterType === 'text') {
            baseConditions[fmField] = filterInfo.filter;
          } else if (filterInfo.filterType === 'number') {
            if (filterInfo.type === 'greatherThan')
              baseConditions[fmField] = `>${filterInfo.filter}`;
            else if (filterInfo.type === 'lessThan')
              baseConditions[fmField] = `<${filterInfo.filter}`;
            else if (filterInfo.type === 'equals')
              baseConditions[fmField] = `=${filterInfo.filter}`;
          }
        }
      });
    }

    const finalQuery: FinalQueryBankReport[] = [];

    if (globalSearch && globalSearch.trim() !== '') {
      const fieldToSearch = [
        'contBanco.ITM::mConceptoDeBancoTexto_v0_20_0',
        'contBanco.ITM::_idu_formaPago_v0_22_1',
      ];

      fieldToSearch.forEach((field) => {
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
