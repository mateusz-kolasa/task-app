import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength } from 'class-validator'
import { MAX_BOARD_TITLE_LENGTH } from 'src/consts/board.consts'

export default class ListCreateData {
  @IsString()
  @MaxLength(MAX_BOARD_TITLE_LENGTH)
  @ApiProperty()
  title: string

  @IsNumber()
  @ApiProperty()
  boardId: number
}
