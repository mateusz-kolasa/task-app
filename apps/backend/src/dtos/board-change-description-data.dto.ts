import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { MAX_BOARD_DESCRIPTION_LENGTH } from 'shared-consts'

export default class ChangeBoardDescriptionData {
  @IsNumber()
  @ApiProperty()
  boardId: number

  @IsString()
  @MaxLength(MAX_BOARD_DESCRIPTION_LENGTH)
  @IsOptional()
  @ApiProperty()
  description: string | null
}
