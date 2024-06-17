import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import CardCreateData from 'src/dtos/card-create-data.dto'
import { CardService } from './card.service'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ApiTags } from '@nestjs/swagger'
import { Card } from 'prisma/prisma-client'
import { AuthRequest } from 'src/types/user-jwt-payload'

@ApiTags('card')
@Controller('card')
@UseGuards(JwtAuthGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  create(@Req() request: AuthRequest, @Body() cardData: CardCreateData): Promise<Card> {
    return this.cardService.create(request, cardData)
  }
}
