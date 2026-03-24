import { Injectable } from '@nestjs/common';
import { FileMakerService } from '../filemaker/filemaker.service';
import { cleanData } from './banks/banks.mapper';
import type { FindRecordsResult } from '../interfaces/filemaker.interface';
import type {
  filterBankModel,
  filterModel,
  FinalQueryBankReport,
} from '../interfaces/reports/report.class.interface';
//import { filterBankModel } from '../../interfaces/reports/report.class.interface';

@Injectable()
export class ReportService {
  constructor(private readonly fmService: FileMakerService) {}
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
  ) {
    const fmQuery = this.makeFilterString(globalSearch, filterModel);

    const fmResponse: FindRecordsResult = await this.fmService.findRecords(
      'ReporteBancos',
      fmQuery,
      offSet + 1, // FileMaker usa 1-based index
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

  private makeFilterString(
    globalSearch: string,
    filterModel: filterBankModel[],
  ): any[] {
    // Implementation for creating filter string
    const fieldMapping = {
      fecha: '_fecha',
      formaPago: '_idu_formaPago|v0.22.1',
      concepto: 'mConceptoDeBancoTexto|v0.20.0',
      abono: 'monto.ORIG.abono|v0.22.1',
      cargo: 'monto.ORIG.cargo|v0.22.1',
    };

    const baseConditions: FinalQueryBankReport = {};

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
              baseConditions[fmField] = `>${filterInfo.value}`;
            else if (filterInfo.type === 'lessThan')
              baseConditions[fmField] = `<${filterInfo.value}`;
            else if (filterInfo.type === 'equal')
              baseConditions[fmField] = `=${filterInfo.value}`;
          }
        }
      });
    }

    const finalQuery: FinalQueryBankReport[] = [];

    if (globalSearch && globalSearch.trim() !== '') {
      const fieldToSearch = [
        'mConceptoDeBancoTexto|v0.20.0',
        '_idu_formaPago|v0.22.1',
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
