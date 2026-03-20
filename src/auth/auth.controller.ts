import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService, ValidateTokenResult } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //EndPoint POST //auth/login-token
  @HttpCode(HttpStatus.OK)
  @Post('login-token')
  async loginWithTokenFileMaker(@Body('token') token: string) {
    if (!token) {
      return {
        message: 'Token es requerido',
      };
    }

    const result: ValidateTokenResult =
      await this.authService.validateTokenFileMaker(token);
    return result;
  }
}
