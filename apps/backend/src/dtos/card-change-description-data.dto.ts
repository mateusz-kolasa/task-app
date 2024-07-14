import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'
import { MAX_CARD_DESCRIPTION_LENGTH } from 'shared-consts'

export default class ChangeCardDescriptionData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsString()
  @MaxLength(MAX_CARD_DESCRIPTION_LENGTH)
  @IsOptional()
  @ApiProperty()
  description: string | null
}
