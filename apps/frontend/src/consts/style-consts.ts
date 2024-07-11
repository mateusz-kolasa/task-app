export const LIST_WIDTH = 240
export const CARD_TEXT_WIDTH = 180
export const SUB_HEADER_HEIGHT = 40

export const APP_SHELL_MAIN_HEIGHT =
  'calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - var(--app-shell-padding, 0px) * 2)'
export const APP_SHELL_SUBHEADER_MAIN_HEIGHT = `calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px)
 - var(--app-shell-padding, 0px) * 2 - ${SUB_HEADER_HEIGHT + 1}px)`
export const LIST_MAX_HEIGHT = `calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px)
 - var(--app-shell-padding, 0px) * 4 - ${SUB_HEADER_HEIGHT + 1}px)`
