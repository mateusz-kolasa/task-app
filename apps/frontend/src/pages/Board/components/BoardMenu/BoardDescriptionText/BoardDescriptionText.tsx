import { Text } from '@mantine/core'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useBoardDataQuery } from 'store/slices/api/board-api-slice'
import useIsAuthorized from 'hooks/useIsAuthorized'
import BoardDescriptionTextForm from './BoardDescriptionTextForm'
import { useTranslation } from 'react-i18next'
import { BOARD_PERMISSIONS } from 'shared-consts'

function BoardDescriptionText() {
  const { boardId } = useParams()
  const { description = '' } = useBoardDataQuery(boardId ?? '', {
    selectFromResult: ({ data }) => {
      return { description: data?.description }
    },
  })

  const { t } = useTranslation()

  const isAuthorized = useIsAuthorized()

  const [isEditing, setIsEditing] = useState(false)

  const handleTitleClick = () => {
    if (isAuthorized(BOARD_PERMISSIONS.edit)) {
      setIsEditing(true)
    }
  }
  const handleClose = () => setIsEditing(false)

  return isEditing ? (
    <BoardDescriptionTextForm description={description ?? ''} handleClose={handleClose} />
  ) : (
    <Text ta='center' onClick={handleTitleClick} fs={description ? 'normal' : 'italic'} c='dimmed'>
      {!description ? t('board.description.empty.text') : description}
    </Text>
  )
}

export default BoardDescriptionText
