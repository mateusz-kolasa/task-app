import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { CardService } from './card.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('card')
@Controller('card')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  create(@Body() cardData: CardCreateData) {
    return this.cardService.create(cardData)
  }
}
