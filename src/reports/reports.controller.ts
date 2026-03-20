import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';
import { CleanedRecord } from './reports.mapper';

interface responseBankReport {
  data: CleanedRecord[];
  meta: {
    totalRecords: number;
    currentPage: number;
    limit: number;
  };
}

interface requestUserReport {
  user: {
    nombre: string;
    rol: string;
  };
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  //EndPoint GET
  @UseGuards(JwtAuthGuard)
  @Get('bancos')
  async getBankReports(
    @Request() req: requestUserReport,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ): Promise<responseBankReport> {
    console.log(
      `El usuario ${req.user.nombre} con rol ${req.user.rol} está pidiendo el reporte de bancos, página ${page} con límite ${limit}`,
    );

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offSet = (pageNumber - 1) * limitNumber;

    return await this.reportsService.fecthFromFileMaker(offSet, limitNumber);
  }
}
