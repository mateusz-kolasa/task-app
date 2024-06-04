import { Button, Popover, Stack, UnstyledButton } from '@mantine/core'
import classes from './Card.module.css'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import schema from './schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { TextInput } from 'react-hook-form-mantine'
import { useCreateBoardMutation } from '../../../store/slices/board-api-slice'
import { useState } from 'react'
import { notifications } from '@mantine/notifications'

export interface BoardCreate {
  title: string
}

function CreateBoardCard() {
  const [isOpened, setIsOpened] = useState(false)

  const methods = useForm<BoardCreate>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
    },
  })

  const [createBoard, { isLoading }] = useCreateBoardMutation()

  const handleSubmit: SubmitHandler<BoardCreate> = boardData => {
    createBoard(boardData)
      .unwrap()
      .then(() => {
        setIsOpened(false)
        methods.reset()
      })
      .catch(() => {
        notifications.show({
          title: 'Could not create board',
          message: 'An error has occured during board creation, try later.',
          color: 'red',
        })
      })
  }

  const togglePopover = () => setIsOpened(!isOpened)

  return (
    <Popover
      width={300}
      trapFocus
      position='bottom'
      withArrow
      shadow='md'
      opened={isOpened}
      onChange={setIsOpened}
    >
      <Popover.Target>
        <UnstyledButton className={classes.card} w={200} h={80} onClick={togglePopover}>
          Create new board
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown>
        <FormProvider {...methods}>
          <form>
            <Stack>
              <TextInput
                name='title'
                label='Board title'
                placeholder='Board title'
                size='xs'
                disabled={isLoading}
              />
              <Button onClick={methods.handleSubmit(handleSubmit)} disabled={isLoading}>
                Create board
              </Button>
            </Stack>
          </form>
        </FormProvider>
      </Popover.Dropdown>
    </Popover>
  )
}

export default CreateBoardCard
