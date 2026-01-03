import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';
import { VoucherService } from './voucher.service';
import { VoucherDto } from './dto/voucher.dto';

@ApiTags('admin-vouchers')
@ApiBearerAuth('JWT-auth')
@Controller('admin/vouchers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class VoucherAdminController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @ApiOperation({
    summary: '🎟️ List Vouchers (Admin)',
    description: `
**Admin voucher management**

Filter/search vouchers by:
- userId
- used
- q (search by code)

Returns list of vouchers with usage info.
    `,
  })
  @ApiQuery({ name: 'userId', required: false, type: Number })
  @ApiQuery({ name: 'used', required: false, type: Boolean })
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiResponse({ status: 200, description: 'List of vouchers', type: [VoucherDto] })
  async list(@Query('userId') userId?: string, @Query('used') used?: string, @Query('q') q?: string) {
    const parsedUserId = userId ? parseInt(userId, 10) : undefined;
    const parsedUsed = typeof used === 'string' ? used === 'true' : undefined;
    return this.voucherService.listAll({
      userId: parsedUserId,
      used: parsedUsed,
      q,
    });
  }
}

