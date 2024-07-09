import { z as zod } from 'zod'

const schema = zod.object({
  description: zod.string().trim(),
})

export default schema
