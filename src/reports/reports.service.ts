import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FileMakerService } from '../filemaker/filemaker.service';
import { cleanData } from './banks/banks.mapper';
import type { FilterBankModel } from '../interfaces/reports/report.class.interface';
import { BaseReportService } from './base-report.service';
import { ReportBankRecord } from '../interfaces/reports/report.class.interface';

@Injectable()
export class BankReportService extends BaseReportService<
  FilterBankModel,
  ReportBankRecord
> {
  constructor(
    fmService: FileMakerService,
    @Inject(CACHE_MANAGER) cacheManager: Cache,
  ) {
    super(fmService, cacheManager, {
      layoutName: 'apiExport_bancoITM',
      cachePrefix: 'bancosITM_',
      dataField: 'contBanco.ITM::_fecha',
      fieldMapping: {
        fecha: 'contBanco.ITM::_fecha',
        formaPago: 'contBanco.ITM::_idu_formaPago_v0_22_1',
        concepto: 'contBanco.ITM::mConceptoDeBancoTexto_v0_20_0',
        abono: 'monto_ORIG_abono_v0_22_1',
        cargo: 'monto_ORIG_cargo_v0_22_1',
      },
      globalSearchFields: [
        'contBanco.ITM::mConceptoDeBancoTexto_v0_20_0',
        'contBanco.ITM::_idu_formaPago_v0_22_1',
      ],
      cleanDataFunction: cleanData,
    });
  }
}
