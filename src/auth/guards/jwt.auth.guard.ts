import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import type { JwtPayload } from '../../interfaces/jwt.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    try {
      //SE VERIFICA EL TOKEN
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: 'SECRET_KEY',
      });
      request['user'] = payload; // Agregar la información del usuario al request para su uso posterior
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : '';
      throw new UnauthorizedException('Token inválido' + message);
    }

    return true;
  }
  // Función auxiliar para separar la palabra "Bearer" del token en sí
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
