import { useTranslation } from 'react-i18next'

const useBoardPermissionsText: () => Record<number, string> = () => {
  const { t } = useTranslation()

  return {
    0: t('board.permission.view'),
    1: t('board.permission.edit'),
    2: t('board.permission.admin'),
    3: t('board.permission.owner'),
  }
}

export default useBoardPermissionsText
