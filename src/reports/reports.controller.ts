import {
  Controller,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { BankReportService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
//import type { RequestUserReport } from '../interfaces/filemaker.interface';
import type {
  FilterBankModel,
  ReportBankRecord,
} from '../interfaces/reports/report.class.interface';
import { PaginatedResponse } from './base-report.service';
//import type { filterBankModel } from '../interfaces/reports/report.class.interface';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: BankReportService) {}

  //EndPoint POST
  @UseGuards(JwtAuthGuard)
  @Post('bancos/buscar')
  async getBankReports(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Body('globalSearch') globalSearch: string = '',
    @Body('filterModel') filterModel: FilterBankModel = {},
    @Body('dateRange')
    dateRange: { startDate: string; endDate: string } = {
      startDate: '',
      endDate: '',
    },
  ): Promise<PaginatedResponse<ReportBankRecord>> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offset = (pageNumber - 1) * limitNumber;

    return this.reportService.fetchFromFileMakerWithFilters(
      offset,
      limitNumber,
      globalSearch,
      filterModel,
      dateRange,
    );
  }
}
