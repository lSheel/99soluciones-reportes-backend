import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  //EndPoint GET
  @UseGuards(JwtAuthGuard)
  @Get('bancos')
  async getBankReports(
    @Request() req: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    console.log(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      `El usuario ${req.user.nombre} con rol ${req.user.rol} está pidiendo el reporte de bancos`,
    );

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const offSet = (pageNumber - 1) * limitNumber;

    return await this.reportsService.fecthFromFileMaker(offSet, limitNumber);
  }
}
