import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsString, MaxLength, ValidateIf } from 'class-validator'
import { MAX_CARD_DESCRIPTION_LENGTH } from 'shared-consts'

export default class ChangeCardDescriptionData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsString()
  @MaxLength(MAX_CARD_DESCRIPTION_LENGTH)
  @ValidateIf(description => description !== null)
  @ApiProperty()
  description: string | null
}
