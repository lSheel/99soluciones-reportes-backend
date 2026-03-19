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
    const filtros = [{}];

    const fmResponse = await this.fmService.findRecords(
      'ReporteBancos',
      filtros,
      offSet + 1,
      limit,
    );
    const rawData = fmResponse.response.data;
    const cleanedData = cleanData(rawData);

    return {
      data: cleanedData, //simulacion de datos, aquí se debería retornar el resultado real de la consulta a FileMaker
      meta: {
        totalRecords: fmResponse.response.data.length,
        currentPage: Math.floor(offSet / limit) + 1,
        limit: Math.ceil(fmResponse.response.data.length / limit),
      },
    };
  }
}
