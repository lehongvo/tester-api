import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.enum';

@Injectable()
export class FixAdminRoleService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.fixAdminRole();
  }

  async fixAdminRole() {
    const admin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (admin && admin.role !== Role.Admin) {
      console.log(`🔧 Fixing admin role: ${admin.role} -> ${Role.Admin}`);
      admin.role = Role.Admin;
      await this.userRepository.save(admin);
      console.log('✅ Admin role fixed!');
    } else if (admin) {
      console.log('✅ Admin role is already correct');
    }
  }
}

