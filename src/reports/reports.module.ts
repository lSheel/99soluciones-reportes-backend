import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportService } from './sales/reports.service';

@Module({
  imports: [],
  controllers: [ReportsController],
  providers: [ReportService],
})
export class ReportsModule {}
