import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'users/users.entity';
import { RefreshToken } from 'users/refresh-token.entity';
import { Repository } from 'typeorm';
import { ChangePasswordDto } from './dto/change-password.dto';

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
    if (!findUser) {
      throw new UnauthorizedException('Username does not exist');
    }
    const isPasswordValid = await bcrypt.compare(
      user.password,
      findUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }
    const payload = { username: user.username, sub: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = await this.generateRefreshToken(findUser.id);

    return {
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

  async create(user: User): Promise<User> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    const newUser = this.userRepository.create({
      username: user.username,
      password: hashedPassword,
    });
    return this.userRepository.save(newUser);
  }

  async changePassword(
    userId: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;

    return this.userRepository.save(user);
  }
}
