import { Text, UnstyledButton } from '@mantine/core'
import PropTypes, { InferProps } from 'prop-types'
import classes from './Card.module.css'

function BoardCard({ title }: InferProps<typeof BoardCard.propTypes>) {
  return (
    <UnstyledButton className={classes.card}>
      <Text>{title}</Text>
    </UnstyledButton>
  )
}

BoardCard.propTypes = { title: PropTypes.string.isRequired }

export default BoardCard
