import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type {
  GetTokenResponse,
  FindRecordsResult,
} from '../interfaces/filemaker.interface';
@Injectable()
export class FileMakerService {
  //Variables para entorno .env
  private readonly fmServer: string =
    process.env.FM_SERVER || 'https://99soluciones.com';
  private readonly database: string = process.env.FM_PORT || 'DEVELOPER';
  private readonly username: string = process.env.FM_USERNAME || 'Luis99';
  private readonly password: string = process.env.FM_PASSWORD || '7257';

  private fmSessionToken: string = '';

  //metodo para obtener el token de FileMaker, se llama cada vez que se necesita hacer una consulta a FileMaker, si el token ya existe y es válido, se reutiliza, de lo contrario se obtiene uno nuevo
  async authFileMaker(): Promise<string> {
    const url = `${this.fmServer}/fmi/data/vLatest/databases/${this.database}/sessions`;
    const credentials = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new InternalServerErrorException(
        'Error al autenticar con FileMaker',
      );
    }
    const data = (await response.json()) as GetTokenResponse;

    this.fmSessionToken = data.response.token;
    return this.fmSessionToken;
  }

  //metodo para hacer una consulta a FileMaker, se llama desde el servicio de reportes, recibe el offset y el limit para paginar los resultados
  async findRecords(
    layout: string,
    query: any[],
    offset: number = 1,
    limit: number = 50,
  ): Promise<FindRecordsResult> {
    if (!this.fmSessionToken) {
      await this.authFileMaker();
    }

    const url = `${this.fmServer}/fmi/data/vLatest/databases/${this.database}/layouts/${layout}/_find`;
    if (query.length === 1 && Object.keys(query[0]).length === 0) {
      query = [
        {
          _fecha: '01/01/2026...02/28/2026',
        },
      ];
    }

    const body = {
      query,
      offset,
      limit,
    };

    console.log(body);

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.fmSessionToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Si el token ha expirado, se obtiene uno nuevo y se reintenta la consulta
    if (response.status === 401) {
      await this.authFileMaker();

      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.fmSessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    }

    const result = (await response.json()) as FindRecordsResult;
    return result;
  }
}
