import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { Role } from './entities/role.enum';
import { UpdateMeDto } from './dto/update-me.dto';

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
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async logout() {
    return { message: 'Logged out successfully' };
  }

  async getMe(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      studentId: user.studentId,
    };
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (dto.email !== undefined) {
      user.email = dto.email;
    }
    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    const saved = await this.userRepository.save(user);

    return {
      id: saved.id,
      username: saved.username,
      role: saved.role,
      email: saved.email,
      fullName: saved.fullName,
    };
  }

  async changeMyPassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { success: true, message: 'Password updated successfully' };
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
        role: Role.Admin,
        email: 'admin@school.edu',
        fullName: 'System Administrator',
      });
      await this.userRepository.save(user);
      console.log('Default admin user created: admin/admin123');
    } else {
      // Always ensure admin has admin role
      if (existingUser.role !== Role.Admin) {
        existingUser.role = Role.Admin;
        await this.userRepository.save(existingUser);
        console.log('Updated existing admin user with admin role');
      }
    }
  }
}
