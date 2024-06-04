import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: JwtStrategy.extractFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  private static extractFromCookie(request: Request): string | null {
    if (
      request.cookies &&
      'access_token' in request.cookies &&
      request.cookies.access_token.length > 0
    ) {
      return request.cookies.access_token
    }

    return null
  }

  async validate(payload: any) {
    return { id: payload.sub, username: payload.username }
  }
}
