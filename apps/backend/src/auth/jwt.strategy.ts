import { Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { extractAccessTokenFromCookies } from 'src/util/cookies.util'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { Request } from 'express'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super({
      jwtFromRequest: extractAccessTokenFromCookies,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    })
  }

  async validate(request: Request, payload: any) {
    const cookie = extractAccessTokenFromCookies(request)
    const storedToken = await this.cacheManager.get(cookie)
    if (storedToken === true) {
      throw new UnauthorizedException()
    }

    return { id: payload.sub, username: payload.username }
  }
}
