import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    this.initializeDefaultUser();
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { username } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
      },
    };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  private async initializeDefaultUser() {
    const existingUser = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const user = this.userRepository.create({
        username: 'admin',
        password: hashedPassword,
      });
      await this.userRepository.save(user);
      console.log('Default user created: admin/admin123');
    }
  }
}

