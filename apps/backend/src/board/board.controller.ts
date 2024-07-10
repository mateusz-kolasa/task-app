import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { BoardService } from './board.service'
import { ApiTags } from '@nestjs/swagger'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { AuthRequest, BoardAuthRequest } from 'src/types/user-jwt-payload'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Board } from '@prisma/client'
import { BoardFullData, UsersInBoardsWithUsername } from 'shared-types'
import BoardAddUserData from 'src/dtos/board-add-user-data.dto'
import ChangeBoardTitleData from 'src/dtos/board-change-title-data.dto'
import ChangeBoardDescriptionData from 'src/dtos/board-change-description-data.dto'
import { BoardPermissions } from 'src/decorators/board-permission.decorator'
import { BOARD_PERMISSIONS, BOARD_SOCKET_MESSAGES } from 'shared-consts'
import { BoardPermissionGuard } from 'src/guards/board-permission.guard'
import { BoardGatewayInterceptor } from 'src/interceptors/board-gateway.interceptor'
import { BoardSocketMessage } from 'src/decorators/board-socket-message.decorator'

@ApiTags('board')
@Controller('board')
@UseInterceptors(BoardGatewayInterceptor)
@UseGuards(JwtAuthGuard, BoardPermissionGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  async getForUser(@Req() request: AuthRequest): Promise<Board[]> {
    return this.boardService.getForUser(request)
  }

  @BoardPermissions(BOARD_PERMISSIONS.view)
  @Get(':boardId')
  async getFull(@Param('boardId', ParseIntPipe) boardId: number): Promise<BoardFullData> {
    return this.boardService.getFull(boardId)
  }

  @Post('create')
  async create(@Req() request: AuthRequest, @Body() boardData: BoardCreateData): Promise<Board> {
    return this.boardService.create(request, boardData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.admin)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.AddUser)
  @Post('users/add')
  async addUser(@Body() userData: BoardAddUserData): Promise<UsersInBoardsWithUsername> {
    return this.boardService.addUser(userData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.ChangeBoardTitle)
  @Patch('change-title')
  async changeTitle(@Body() titleData: ChangeBoardTitleData): Promise<Board> {
    return this.boardService.changeTitle(titleData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.ChangeBoardDescription)
  @Patch('change-description')
  async changeDescription(@Body() descriptionData: ChangeBoardDescriptionData): Promise<Board> {
    return this.boardService.changeDescription(descriptionData)
  }

  @BoardPermissions(BOARD_PERMISSIONS.owner)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.DeleteBoard)
  @Delete(':boardId')
  async delete(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardService.delete(boardId)
  }

  @BoardPermissions(BOARD_PERMISSIONS.view)
  @BoardSocketMessage(BOARD_SOCKET_MESSAGES.LeaveBoard)
  @Delete(':boardId/leave')
  async leave(@Req() request: BoardAuthRequest, @Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardService.leave(request, boardId)
  }
}
