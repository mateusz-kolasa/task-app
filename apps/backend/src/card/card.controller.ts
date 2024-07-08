import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { CardService } from './card.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ApiTags } from '@nestjs/swagger'
import { Card } from 'prisma/prisma-client'
import ChangeCardPositionData from 'src/dtos/card-change-position.data.dto'
import ChangeCardTitleData from 'src/dtos/card-change-title-data.dto'
import { ChangeCardPositionResultData, DeleteCardData } from 'shared-types'
import { BoardPermissionGuard } from 'src/guards/board-permission.guard'
import { BoardPermissions } from 'src/decorators/board-permission.decorator'
import { BOARD_PERMISSIONS } from 'shared-consts'
import { CardAuthRequest } from 'src/types/user-jwt-payload'

@ApiTags('card')
@Controller('card')
@UseGuards(JwtAuthGuard, BoardPermissionGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Post()
  create(@Body() cardData: CardCreateData): Promise<Card> {
    return this.cardService.create(cardData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Post('change-position')
  changePosition(
    @Req() request: CardAuthRequest,
    @Body() changePositionData: ChangeCardPositionData
  ): Promise<ChangeCardPositionResultData> {
    return this.cardService.changePosition(request, changePositionData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Patch('change-title')
  changeTitle(
    @Req() request: CardAuthRequest,
    @Body() changeTitleData: ChangeCardTitleData
  ): Promise<Card> {
    return this.cardService.changeTitle(request, changeTitleData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Delete(':cardId')
  delete(
    @Req() request: CardAuthRequest,
    @Param('cardId', ParseIntPipe) cardId: number
  ): Promise<DeleteCardData> {
    return this.cardService.delete(request, cardId)
  }
}
