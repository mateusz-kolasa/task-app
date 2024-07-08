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
import { BOARD_PERMISSIONS } from 'shared-consts'
import { BoardPermissionGuard } from 'src/guards/board-permission.guard'

@ApiTags('board')
@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  async getForUser(@Req() request: AuthRequest): Promise<Board[]> {
    return this.boardService.getForUser(request)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.view)
  @Get(':boardId')
  async getFull(@Param('boardId', ParseIntPipe) boardId: number): Promise<BoardFullData> {
    return this.boardService.getFull(boardId)
  }

  @Post('create')
  async create(@Req() request: AuthRequest, @Body() boardData: BoardCreateData): Promise<Board> {
    return this.boardService.create(request, boardData)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.admin)
  @Post('users/add')
  async addUser(@Body() userData: BoardAddUserData): Promise<UsersInBoardsWithUsername> {
    return this.boardService.addUser(userData)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Patch('change-title')
  async changeTitle(@Body() titleData: ChangeBoardTitleData): Promise<Board> {
    return this.boardService.changeTitle(titleData)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.edit)
  @Patch('change-description')
  async changeDescription(@Body() descriptionData: ChangeBoardDescriptionData): Promise<Board> {
    return this.boardService.changeDescription(descriptionData)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.owner)
  @Delete(':boardId')
  async delete(@Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardService.delete(boardId)
  }

  @UseGuards(BoardPermissionGuard)
  @BoardPermissions(BOARD_PERMISSIONS.view)
  @Delete(':boardId/leave')
  async leave(@Req() request: BoardAuthRequest, @Param('boardId', ParseIntPipe) boardId: number) {
    return this.boardService.leave(request, boardId)
  }
}
