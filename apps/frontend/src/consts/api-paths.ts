const API_PATHS = {
  getAuth: 'auth',
  login: 'auth/login',
  register: 'auth/register',
  logout: 'auth/logout',
  board: 'board',
  changeBoardTitle: 'board/change-title',
  changeBoardDescription: 'board/change-description',
  leaveBoard: (id: string) => `board/${id}/leave`,
  createBoard: 'board/create',
  addBoardUser: 'board/users/add',
  list: 'list',
  changeListPosition: 'list/change-position',
  changeListTitle: 'list/change-title',
  card: 'card',
  changeCardPosition: 'card/change-position',
  changeCardTitle: 'card/change-title',
}

export default API_PATHS
