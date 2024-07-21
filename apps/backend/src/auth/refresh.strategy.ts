import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { extractRefreshTokenFromCookies } from 'src/util/cookies.util'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Request } from 'express'

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super({
      jwtFromRequest: extractRefreshTokenFromCookies,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: any) {
    const cookie = extractRefreshTokenFromCookies(request)
    const storedToken = await this.cacheManager.get(cookie)
    if (storedToken === true) {
      throw new UnauthorizedException()
    }

    return { id: payload.sub, username: payload.username }
  }
}
