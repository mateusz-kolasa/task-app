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
  UseInterceptors,
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
import { BOARD_PERMISSIONS, BOARD_SOCKET_MESSAGES } from 'shared-consts'
import { CardAuthRequest } from 'src/types/user-jwt-payload'
import ChangeCardDescriptionData from 'src/dtos/card-change-description-data.dto'
import { BoardSocketMessage } from 'src/decorators/board-socket-message.decorator'
import { BoardGatewayInterceptor } from 'src/interceptors/board-gateway.interceptor'
import CardAssignUserData from 'src/dtos/card-assign-user-data.dto'

@ApiTags('card')
@Controller('card')
@UseInterceptors(BoardGatewayInterceptor)
@UseGuards(JwtAuthGuard, BoardPermissionGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.AddCard)
  @Post()
  create(@Body() cardData: CardCreateData): Promise<Card> {
    return this.cardService.create(cardData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.ChangeCardPosition)
  @Post('change-position')
  changePosition(
    @Req() request: CardAuthRequest,
    @Body() changePositionData: ChangeCardPositionData
  ): Promise<ChangeCardPositionResultData> {
    return this.cardService.changePosition(request, changePositionData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.ChangeCardTitle)
  @Patch('change-title')
  changeTitle(
    @Req() request: CardAuthRequest,
    @Body() changeTitleData: ChangeCardTitleData
  ): Promise<Card> {
    return this.cardService.changeTitle(request, changeTitleData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.ChangeCardDescription)
  @Patch('change-description')
  changeDescription(
    @Req() request: CardAuthRequest,
    @Body() changeDescriptionData: ChangeCardDescriptionData
  ): Promise<Card> {
    return this.cardService.changeDescription(request, changeDescriptionData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.AssignCardUser)
  @Patch('assign-user')
  assignUser(@Req() request: CardAuthRequest, @Body() assignUserData: CardAssignUserData) {
    return this.cardService.assignUser(request, assignUserData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.DeleteCard)
  @Delete(':cardId')
  delete(
    @Req() request: CardAuthRequest,
    @Param('cardId', ParseIntPipe) cardId: number
  ): Promise<DeleteCardData> {
    return this.cardService.delete(request, cardId)
  }
}
