import { z as zod } from 'zod'

const schema = zod.object({
  title: zod.string().trim(),
})

export default schema
