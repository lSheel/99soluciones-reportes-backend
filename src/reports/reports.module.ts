import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportService } from './reports.service';

@Module({
  imports: [],
  controllers: [ReportsController],
  providers: [ReportService],
})
export class ReportsModule {}
