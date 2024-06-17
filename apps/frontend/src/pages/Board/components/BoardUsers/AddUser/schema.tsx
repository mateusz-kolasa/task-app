import { z as zod } from 'zod'

const schema = zod.object({
  username: zod.string().trim().min(1),
  permissions: zod.string(),
})

export default schema
