
import { Body, Controller, Post, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Query() signInDto: Record<string, any>) {
        // return this.authService.signIn("thinh","111345");
        return signInDto;
    }
}
