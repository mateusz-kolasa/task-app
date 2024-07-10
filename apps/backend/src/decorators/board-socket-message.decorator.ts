import { Reflector } from '@nestjs/core'
import { BOARD_SOCKET_MESSAGES } from 'shared-consts'

export const BoardSocketMessage = Reflector.createDecorator<BOARD_SOCKET_MESSAGES>()
