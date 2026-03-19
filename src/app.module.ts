import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FileMakerModule } from './filemaker/filemaker.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [AuthModule, FileMakerModule, ReportsModule], // Importamos los módulos necesarios
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
