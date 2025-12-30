import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@ApiTags('admin-fix')
@Controller('admin-fix')
export class AdminFixController {
  constructor(private readonly adminService: AdminService) {}

  @Post('fix-admin-role')
  @ApiOperation({
    summary: '🔧 Fix Admin Role (Public - No Auth Required)',
    description: `
**Fix admin user role if it's incorrect**

**No authentication required** - This is a public endpoint to fix admin role issues.

This endpoint ensures the admin user (username: "admin") has the correct role. 
Use this if admin role was set incorrectly and you cannot access admin endpoints.

**Note:** This endpoint is intentionally public to allow fixing role issues.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin role fixed or already correct',
  })
  async fixAdminRole() {
    return this.adminService.fixAdminRole();
  }
}