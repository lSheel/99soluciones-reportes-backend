import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateTokenFileMaker(token: string): Promise<any> {
    //BUSCAR Y VALIDAR EL TOKEN EN FILEMAKER

    console.log(`Validando token: ${token}`);

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulación de retraso en la validación del token

    //simulacion de respuesta de filemaker
    const fmResponse = {
      valid: true,
      user: {
        id: 1,
        name: 'Usuario de FileMaker',
        role: 'admin',
      },
    };

    if (!fmResponse.valid) {
      throw new UnauthorizedException('Token no válido');
    }

    // ELIMINAR TOKEN DE FILEMAKER Y GENERAR JWT PROPIO\
    // Aquí se podría agregar lógica para eliminar el token de FileMaker si es necesario

    // Generar un nuevo JWT con la información del usuario obtenida de FileMaker
    const payload = {
      sub: fmResponse.user.id,
      name: fmResponse.user.name,
      role: fmResponse.user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: fmResponse.user,
    };
  }
}
