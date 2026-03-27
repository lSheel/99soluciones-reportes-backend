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
import type { ResponseBankReport } from '../interfaces/reports/reports.interface';
import type { FilterBankModel } from '../interfaces/reports/report.class.interface';
//import type { filterBankModel } from '../interfaces/reports/report.class.interface';

@Controller('reports')
export class ReportsController {
  constructor(private readonly ReportService: BankReportService) {}

  //EndPoint POST
  @UseGuards(JwtAuthGuard)
  @Post('bancos/buscar')
  async getBankReports(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Body('globalSearch') globalSearch: string = '',
    @Body('filterModel') filterModel: FilterBankModel,
    @Body('dateRange')
    dateRange: { startDate: string; endDate: string } = {
      startDate: '',
      endDate: '',
    },
  ): Promise<ResponseBankReport> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offSet = (pageNumber - 1) * limitNumber;

    return this.ReportService.fectFromFileMakerWithFilters(
      offSet,
      limitNumber,
      globalSearch,
      filterModel,
      dateRange,
    );
  }
}
