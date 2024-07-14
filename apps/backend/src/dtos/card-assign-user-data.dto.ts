import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional } from 'class-validator'

export default class CardAssignUserData {
  @IsNumber()
  @ApiProperty()
  cardId: number

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  userId: number | null
}
