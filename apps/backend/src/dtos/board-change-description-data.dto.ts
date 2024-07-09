import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength, ValidateIf } from 'class-validator'
import { MAX_BOARD_DESCRIPTION_LENGTH } from 'shared-consts'

export default class ChangeBoardDescriptionData {
  @IsNumber()
  @ApiProperty()
  boardId: number

  @IsString()
  @MaxLength(MAX_BOARD_DESCRIPTION_LENGTH)
  @ValidateIf(description => description !== null)
  @ApiProperty()
  description: string | null
}
