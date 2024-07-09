import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'
import { MAX_BOARD_TITLE_LENGTH } from 'shared-consts'

export default class BoardCreateData {
  @IsString()
  @MinLength(1)
  @MaxLength(MAX_BOARD_TITLE_LENGTH)
  @ApiProperty()
  title: string
}
