import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'users/users.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: User, @Req() req: Request) {
    return this.authService.login(user);
  }

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);
    return { access_token: newAccessToken };
  }
}
