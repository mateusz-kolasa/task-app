import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { BoardService } from './board.service'
import { ApiTags } from '@nestjs/swagger'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { Board } from '@prisma/client'
import { BoardFullData } from 'shared-types'

@ApiTags('board')
@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  async getForUser(@Req() request: AuthRequest): Promise<Board[]> {
    return this.boardService.getForUser(request)
  }

  @Get(':id')
  async getFull(@Param('id') id: string): Promise<BoardFullData> {
    return this.boardService.getFull(id)
  }

  @Post('create')
  async create(@Req() request: AuthRequest, @Body() boardData: BoardCreateData): Promise<Board> {
    return this.boardService.create(request, boardData)
  }
}
