import {
  Controller,
  Query,
  UseGuards,
  Request,
  Post,
  Body,
} from '@nestjs/common';
import { ReportService } from './sales/reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
//import type { RequestUserReport } from '../interfaces/filemaker.interface';
import type { ResponseBankReport } from '../interfaces/reports/reports.interface';
//import type { filterBankModel } from '../interfaces/reports/report.class.interface';

@Controller('reports')
export class ReportsController {
  constructor(private readonly ReportService: ReportService) {}

  //EndPoint POST
  @UseGuards(JwtAuthGuard)
  @Post('bancos/buscar')
  async getBankReports(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Body('globalSearch') globalSearch: string = '',
    @Body('filterModel') filterModel: any[],
  ): Promise<ResponseBankReport> {
    // console.log(
    //   `El usuario ${req.user.nombre} con rol ${req.user.rol} está pidiendo el reporte de bancos, página ${page} con límite ${limit}`,
    // );

    console.log(globalSearch);
    console.log(filterModel);

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offSet = (pageNumber - 1) * limitNumber;

    return await this.ReportService.fecthFromFileMaker(
      offSet,
      limitNumber,
      // globalSearch,
      // filterModel,
    );
  }
}
