import { Injectable } from '@nestjs/common';
import { FileMakerService } from '../filemaker/filemaker.service';
import { cleanData } from './reports.mapper';
import type { FindRecordsResult } from '../interfaces/filemaker.interface';

@Injectable()
export class ReportsService {
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
}
