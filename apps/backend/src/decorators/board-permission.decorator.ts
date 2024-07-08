import { Reflector } from '@nestjs/core'
import { BOARD_PERMISSIONS } from 'shared-consts'

export const BoardPermissions = Reflector.createDecorator<BOARD_PERMISSIONS>()
