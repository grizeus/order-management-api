import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
@UseGuards(AuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sync')
  async syncUser(
    @Body()
    userData: {
      clerkUserId: string;
      name: string;
      email: string;
    },
    @Req() req: any,
  ) {
    if (req.user.sub !== userData.clerkUserId) {
      throw new UnauthorizedException('User ID mismatch');
    }
    const user = await this.authService.syncUser(userData);

    if (!user) {
      throw new HttpException(
        'Error syncing user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return { userId: user.id, success: true };
  }

  @Get('/')
  async getUserProfile(@Req() req: any) {
    const user = await this.authService.findByClerkId(req.user.sub);
    return user;
  }
}
