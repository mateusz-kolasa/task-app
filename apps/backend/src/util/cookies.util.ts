import { Request } from 'express'

const extractFromCookies =
  (key: string) =>
  (request: Request): string | null => {
    if (request.cookies && key in request.cookies && request.cookies[key].length > 0) {
      return request.cookies[key]
    }

    return null
  }

export const extractAccessTokenFromCookies = extractFromCookies('access_token')
export const extractRefreshTokenFromCookies = extractFromCookies('refresh_token')
