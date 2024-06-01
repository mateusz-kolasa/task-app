import { z as zod } from 'zod';

const schema = zod.object({
  username: zod.string().trim().min(1),
  password: zod.string().trim().min(1),
});

export default schema;
