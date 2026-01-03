import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoucherDto } from './dto/voucher.dto';
import { VoucherService } from './voucher.service';

@ApiTags('my-vouchers')
@ApiBearerAuth('JWT-auth')
@Controller('me/vouchers')
@UseGuards(JwtAuthGuard)
export class VoucherMeController {
  constructor(private readonly voucherService: VoucherService) {}

  @Get()
  @ApiOperation({
    summary: '🎟️ List My Vouchers',
    description: `
**Get all vouchers assigned to the current authenticated user**

Returns a list of your vouchers, both used and unused.
    `,
  })
  @ApiResponse({ status: 200, description: 'List of my vouchers', type: [VoucherDto] })
  async listMine(@Request() req) {
    return this.voucherService.listMine(req.user.userId);
  }
}

