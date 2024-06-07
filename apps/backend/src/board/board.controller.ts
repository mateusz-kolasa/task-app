import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { BoardService } from './board.service'
import { ApiBody } from '@nestjs/swagger'
import BoardCreateData from 'src/dtos/board-create-data.dto'
import { AuthRequest } from 'src/types/user-jwt-payload'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'

@Controller('board')
@UseGuards(JwtAuthGuard)
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Get()
  async getForUser(@Req() request: AuthRequest) {
    return this.boardService.getForUser(request)
  }

  @Get(':id')
  async getFull(@Param('id') id: string) {
    return this.boardService.getFull(id)
  }

  @Post('create')
  @ApiBody({ type: BoardCreateData })
  async create(@Req() request: AuthRequest, @Body() boardData: BoardCreateData) {
    return this.boardService.create(request, boardData)
  }
}
