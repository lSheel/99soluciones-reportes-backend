/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export function cleanData(rawData: any[]) {
  const cleanedData = rawData.map((record: any) => {
    const fields = record.fieldData;
    const portals = record.portalData;

    // Extraemos y limpiamos datos de banco.ITM
    const cleanedRecord = {
      idRegistro: record.recordId,
      fecha: fields['_fecha'],
      formaPago: fields['_idu_formaPago|v0.22.1'],
      concepto: fields['mConceptoDeBancoTexto|v0.20.0'],
      abono: fields['monto.ORIG.abono|v0.22.1']
        ? Number(fields['monto.ORIG.abono|v0.22.1'])
        : 0,
      cargo: fields['monto.ORIG.cargo|v0.22.1']
        ? Number(fields['monto.ORIG.cargo|v0.22.1'])
        : 0,
    };

    const ingresos = portals['contBanco.ITM|contINGRESO_|_x_bancoItmID'];
    const egresos = portals['contBanco.ITM|contEGRESO_|_x_bancoItmID'];

    if (ingresos && ingresos.length > 0) {
      const primerIngreso = ingresos.length > 0 ? ingresos[0] : null;
      cleanedRecord['montoIngreso'] = primerIngreso
        ? primerIngreso[
            'contBanco.ITM|contINGRESO_|_x_bancoItmID::monto.MXN.applicadoGranTotal'
          ]
        : 0;
      cleanedRecord['estadoIngreso'] = primerIngreso
        ? primerIngreso[
            'contBanco.ITM|contINGRESO_|_x_bancoItmID::isT.Abierto|Cerrado'
          ]
        : 'N/A';
    }

    if (egresos && egresos.length > 0) {
      const primerEgreso = egresos.length > 0 ? egresos[0] : null;
      cleanedRecord['montoEgreso'] = primerEgreso
        ? primerEgreso[
            'contBanco.ITM|contEGRESO_|_x_bancoItmID::monto.MXN.applicadoGranTotal'
          ]
        : 0;
      cleanedRecord['estadoEgreso'] = primerEgreso
        ? primerEgreso[
            'contBanco.ITM|contEGRESO_|_x_bancoItmID::isT.Abierto|Cerrado'
          ]
        : 'N/A';
    }
  });
  return cleanedData;
}
