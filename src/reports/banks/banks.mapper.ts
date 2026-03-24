import type { RawRecord } from '../../interfaces/reports/reports.interface';
import type { ReportBankRecord } from '../../interfaces/reports/report.class.interface';

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getNumber(value: unknown): number {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

export function cleanData(rawData: RawRecord[]): ReportBankRecord[] {
  const cleanedData = rawData.map((record: RawRecord) => {
    const fields = record.fieldData;
    const portals = record.portalData;

    // Extraemos y limpiamos datos de banco.ITM
    const cleanedRecord: ReportBankRecord = {
      idRegistro: record.recordId,
      fecha: getString(fields['_fecha']),
      formaPago: getString(fields['_idu_formaPago_v0_22_1']),
      concepto: getString(fields['mConceptoDeBancoTexto_v0_20_0']),
      abono: getNumber(fields['monto_ORIG_abono_v0_22_1']),
      cargo: getNumber(fields['monto_ORIG_cargo_v0_22_1']),
    };

    const ingresos = Array.isArray(
      portals['contBanco.ITM|contINGRESO_|_x_bancoItmID'],
    )
      ? (portals['contBanco.ITM|contINGRESO_|_x_bancoItmID'] as Record<
          string,
          unknown
        >[])
      : [];
    const egresos = Array.isArray(
      portals['contBanco.ITM|contEGRESO_|_x_bancoItmID'],
    )
      ? (portals['contBanco.ITM|contEGRESO_|_x_bancoItmID'] as Record<
          string,
          unknown
        >[])
      : [];

    if (ingresos.length > 0) {
      const primerIngreso = ingresos[0];
      cleanedRecord['montoIngreso'] = getNumber(
        primerIngreso[
          'contBanco.ITM|contINGRESO_|_x_bancoItmID::monto.MXN.applicadoGranTotal'
        ],
      );
      cleanedRecord['estadoIngreso'] =
        getString(
          primerIngreso[
            'contBanco.ITM|contINGRESO_|_x_bancoItmID::isT.Abierto|Cerrado'
          ],
        ) || 'N/A';
    }

    if (egresos.length > 0) {
      const primerEgreso = egresos[0];
      cleanedRecord['montoEgreso'] = getNumber(
        primerEgreso[
          'contBanco.ITM|contEGRESO_|_x_bancoItmID::monto.MXN.ComplementadoGranTotal'
        ],
      );
      cleanedRecord['estadoEgreso'] =
        getString(
          primerEgreso[
            'contBanco.ITM|contEGRESO_|_x_bancoItmID::isT.Abierto|Cerrado'
          ],
        ) || 'N/A';
    }
    return cleanedRecord;
  });
  return cleanedData;
}
