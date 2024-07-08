import { Controller, Post, UseGuards, Body, Res, Req, Get, Delete } from '@nestjs/common'
import { LocalAuthGuard } from './local-auth.guard'
import { AuthService } from './auth.service'
import UserRegisterData from 'src/dtos/user-register-data.dto'
import { ApiBody } from '@nestjs/swagger'
import UserLoginData from 'src/dtos/user-login-data.dto'
import { Response } from 'express'
import { JwtAuthGuard } from './jwt-auth.guard'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { UserInfoData } from 'shared-types'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: UserRegisterData })
  async register(
    @Body() userData: UserRegisterData,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserInfoData> {
    return this.authService.register(userData, response)
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: UserLoginData })
  async logIn(
    @Req() request,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserInfoData> {
    return this.authService.login(request.user, response)
  }

  @Delete('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAuthStatus(@Req() request: AuthRequest): Promise<UserInfoData> {
    return this.authService.getAuthStatus(request)
  }
}
