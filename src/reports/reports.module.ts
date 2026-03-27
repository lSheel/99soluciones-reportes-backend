import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { BankReportService } from './reports.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // Tiempo de vida en segundos
      max: 100, // Número máximo de elementos en caché
    }),
  ],
  controllers: [ReportsController],
  providers: [BankReportService],
})
export class ReportsModule {}
