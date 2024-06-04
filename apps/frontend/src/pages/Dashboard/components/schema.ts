import { z as zod } from 'zod'

const schema = zod.object({
  title: zod.string().trim().min(1),
})

export default schema
