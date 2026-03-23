import { Injectable } from '@nestjs/common';
import { FileMakerService } from '../../filemaker/filemaker.service';
import { cleanData } from '../banks/banks.mapper';
import type { FindRecordsResult } from '../../interfaces/filemaker.interface';
//import { filterBankModel } from '../../interfaces/reports/report.class.interface';

@Injectable()
export class ReportService {
  constructor(private readonly fmService: FileMakerService) {}
  async fecthFromFileMaker(
    offSet: number,
    limit: number,
    // globalSearch: string,
    // filterModel: any[],
  ) {
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

  /*private makeFilterString(globalSearch: string, filterModel: any[]): any[] {
    // Implementation for creating filter string
    const fieldMapping = {
      fecha: '_fecha',
      formaPago: '_idu_formaPago|v0.22.1',
      concepto: 'mConceptoDeBancoTexto|v0.20.0',
      abono: 'monto.ORIG.abono|v0.22.1',
      cargo: 'monto.ORIG.cargo|v0.22.1',
    };

    let baseConditions: any = {};

    if (filterModel && Object.keys(filterModel).length > 0) {
      Object.keys(filterModel).forEach((key) => {
        const fmField = fieldMapping[key];
        if (fmField) {
          const filterInfo = filterModel; //[key as keyof filterBankModel];
          if (filterInfo.filterType === 'text') {
            baseConditions[fmField] = filterInfo.value;
          } else if (filterInfo.filterType === 'number') {
            if (filterInfo.filterType === 'greatherThan')
              baseConditions[fmField] = `>${filterInfo.value}`;
            else if(filterInfo.filterType === 'lessThan') baseConditions[fmField] = `<${filterInfo.value}`;
            else if (filterInfo.filterType === 'equal') baseConditions[fmField] = `=${filterInfo.value}`;
          }
        }
      });
    }
    
    let finalQuery = [];
    
    if (globalSearch && globalSearch.trim() !== '') {
      const fieldToSearch = [
        'mConceptoDeBancoTexto|v0.20.0',
        '_idu_formaPago|v0.22.1'
      ];


      fieldToSearch.forEach((field) => {
        finalQuery.push({
          ...baseConditions,
          [field]: `*${globalSearch}*`,  
        });
      });
    }else {
      finalQuery.push(baseConditions);
    }

    if(finalQuery.length === 0 || Object.keys(finalQuery[0]).length === 0) return [{}]

    return finalQuery;
  } */
}
