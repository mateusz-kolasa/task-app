import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common'
import { LocalAuthGuard } from './local-auth.guard'
import { AuthService } from './auth.service'
import UserRegisterData from 'src/dtos/user-register-data.dto'
import { ApiBody } from '@nestjs/swagger'
import UserLoginData from 'src/dtos/user-login-data.dto'

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: UserRegisterData) {
    return this.authService.register(userData)
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({ type: UserLoginData })
  async logIn(@Request() request) {
    return this.authService.login(request.user)
  }
}
