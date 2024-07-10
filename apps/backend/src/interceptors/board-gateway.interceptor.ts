import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable, tap } from 'rxjs'
import { BoardGateway } from 'src/board/board.gateway'
import { BoardSocketMessage } from 'src/decorators/board-socket-message.decorator'
import { BoardAuthRequest } from 'src/types/user-jwt-payload'

@Injectable()
export class BoardGatewayInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private boardGateway: BoardGateway
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const socketMessage = this.reflector.get(BoardSocketMessage, context.getHandler())
    if (socketMessage === undefined) {
      return next.handle().pipe()
    }

    const request: BoardAuthRequest = context.switchToHttp().getRequest()
    return next.handle().pipe(
      tap(response => {
        this.boardGateway.sendMessage(socketMessage, {
          boardId: request.boardId,
          payload: response,
        })
      })
    )
  }
}
