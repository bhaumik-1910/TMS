import { Body, Controller, Get, Headers, HttpCode, Post, Req } from '@nestjs/common';
import type { ReqCtx } from '../../framework/auth/auth-user.js';
import { Ctx, LoginToken, Public, type CtxRequest } from '../../framework/auth/decorators.js';
import { AuthService } from './auth.service.js';
import { LoginDto, RefreshDto, SwitchCompanyDto } from './dto/auth.dto.js';

@Controller(['auth', 'api/auth', 'api/v1/auth'])
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** Password check against the identity. Returns a login token and the companies to choose from. */
  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  /** The picker's list again (after the login token was kept for a while). Login token or company token. */
  @LoginToken()
  @Get('companies')
  companies(@Req() request: CtxRequest) {
    return this.auth.companies((request.loginClaims?.sub ?? request.user?.platformUserId) as number);
  }

  /** Opens a company: company token plus a refresh token bound to it. Also used to switch company. */
  @LoginToken()
  @Post('switch-company')
  @HttpCode(200)
  switchCompany(@Req() request: CtxRequest, @Body() dto: SwitchCompanyDto, @Headers('user-agent') userAgent?: string) {
    const platformUserId = (request.loginClaims?.sub ?? request.user?.platformUserId) as number;
    return this.auth.switchCompany(platformUserId, dto.companyId, dto.refreshToken, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.refresh(dto.refreshToken, userAgent);
  }

  @Public()
  @Post('logout')
  @HttpCode(204)
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
  }

  @Get('me')
  me(@Ctx() ctx: ReqCtx) {
    return this.auth.me(ctx.user);
  }
}
