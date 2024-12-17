import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'users/users.entity';
import { RefreshToken } from 'users/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(user: User) {
    const findUser = await this.userRepository.findOne({
      where: { username: user.username },
    });
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(findUser.id);

    return {
      message: 'Login successful',
      accessToken,
      refreshToken,
    };
  }

  async generateRefreshToken(user: number): Promise<string> {
    const token = this.jwtService.sign({ sub: user }, { expiresIn: '10m' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshToken = this.refreshTokenRepository.create({
      token: token,
      created_at: new Date(),
      expires_at: expiresAt,
      user: { id: user },
    });

    await this.refreshTokenRepository.save(refreshToken);

    return token;
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const payload = {
      username: tokenRecord.user.username,
      sub: tokenRecord.user.id,
    };
    return this.jwtService.sign(payload, { expiresIn: '15m' });
  }
}
