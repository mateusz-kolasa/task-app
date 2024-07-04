import { Socket, io } from 'socket.io-client'
import { BOARD_SOCKET_MESSAGES } from 'shared-consts'
import {
  addCard,
  addList,
  addUser,
  changeBoardDescription,
  changeBoardTitle,
  changeCardPosition,
  changeListPosition,
  deleteBoard,
  deleteCard,
  deleteList,
  leaveBoard,
  updateCardTitle,
  updateListTitle,
} from 'utils/boardSocketHelper'

class BoardSocket {
  socket: Socket

  constructor() {
    this.socket = io('ws://localhost:3000/api/ws/board', {
      transports: ['websocket'],
      autoConnect: false,
    })
  }

  connect() {
    if (!this.socket.connected) {
      this.socket.connect()
      this.addListeners()
    }
  }

  disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect()
    }
  }

  joinBoard(boardId: number) {
    this.socket.emit('join', boardId)
  }

  private addListeners() {
    this.socket.on(BOARD_SOCKET_MESSAGES.AddUser, addUser)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeBoardTitle, changeBoardTitle)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeBoardDescription, changeBoardDescription)
    this.socket.on(BOARD_SOCKET_MESSAGES.LeaveBoard, leaveBoard)
    this.socket.on(BOARD_SOCKET_MESSAGES.DeleteBoard, deleteBoard)
    this.socket.on(BOARD_SOCKET_MESSAGES.AddList, addList)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeListTitle, updateListTitle)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeListPosition, changeListPosition)
    this.socket.on(BOARD_SOCKET_MESSAGES.DeleteList, deleteList)
    this.socket.on(BOARD_SOCKET_MESSAGES.AddCard, addCard)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeCardTitle, updateCardTitle)
    this.socket.on(BOARD_SOCKET_MESSAGES.ChangeCardPosition, changeCardPosition)
    this.socket.on(BOARD_SOCKET_MESSAGES.DeleteCard, deleteCard)
  }
}

export default new BoardSocket()
