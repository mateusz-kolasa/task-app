import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_BOARD_TITLE_LENGTH } from 'src/consts/board.consts'

export default class ListCreateData {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_BOARD_TITLE_LENGTH)
  @ApiProperty()
  title: string

  @IsNumber()
  @ApiProperty()
  boardId: number
}
