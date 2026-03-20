/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { FileMakerService } from '../filemaker/filemaker.service';
import { cleanData } from './reports.mapper';

@Injectable()
export class ReportsService {
  constructor(private readonly fmService: FileMakerService) {}
  async fecthFromFileMaker(offSet: number, limit: number) {
    // eslint-disable-next-line prettier/prettier
    const filtros = [{ '_fecha': '01/01/2024...02/28/2024' }];

    const fmResponse = await this.fmService.findRecords(
      'ReporteBancos',
      filtros,
      offSet + 1,
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
