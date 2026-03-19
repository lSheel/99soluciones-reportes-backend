import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.authService.validateTokenFileMaker(token);
    console.log(result);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }
}
