import { Controller, Post, Body, Req, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'users/users.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() user: User, @Req() req: Request) {
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() user: User) {
    return this.authService.create(user);
  }

  @Post('refresh')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    const newAccessToken =
      await this.authService.refreshAccessToken(refreshToken);
    return { access_token: newAccessToken };
  }

  @Patch(':userId/change-password')
  async changePassword(
    @Param('userId') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
