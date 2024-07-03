import { ForbiddenException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { SockedBoardUpdateData } from 'shared-types'
import { Server, Socket } from 'socket.io'
import { PrismaService } from 'src/prisma/prisma.service'

@WebSocketGateway({
  namespace: 'api/ws/board',
  cors: { credentials: true },
  cookie: true,
  transports: ['websocket'],
})
export class BoardGateway implements OnGatewayConnection {
  @WebSocketServer() private server: Server
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService
  ) {}

  async handleConnection(socket: Socket) {
    const userId = await this.extractUserIdFromCookies(socket)
    if (!userId) {
      socket.disconnect()
    }
  }

  @SubscribeMessage('join')
  async joinUserToMeeting(@MessageBody() boardId: number, @ConnectedSocket() client: Socket) {
    const userId = await this.extractUserIdFromCookies(client)
    const userInBoard = await this.prisma.usersInBoards.findFirst({
      where: {
        userId: parseInt(userId),
        boardId: boardId,
      },
    })

    if (!userInBoard) {
      throw new ForbiddenException()
    }

    client.join(boardId.toString())
  }

  async sendMessage(message: string, payload: SockedBoardUpdateData<any>) {
    this.server.to(payload.boardId.toString()).emit(message, payload)
  }

  private async extractUserIdFromCookies(client: Socket): Promise<string | undefined> {
    const { cookie } = client.request.headers
    if (!cookie) {
      return undefined
    }

    const mappedCookies = Object.fromEntries(
      cookie.split(';').map(currentCookie => {
        const [key, value] = currentCookie.split('=')

        return [key.trim(), value.trim()]
      })
    )

    const authCookie = mappedCookies['access_token']

    if (authCookie) {
      const user = await this.jwtService.verifyAsync(authCookie)
      return user.sub
    }

    return undefined
  }
}
