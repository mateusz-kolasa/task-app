import { z as zod } from 'zod';

export const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/;

const schema = zod
  .object({
    username: zod.string().trim().min(1),
    password: zod
      .string()
      .trim()
      .min(8, { message: 'Password must have atleast 8 characters.' })
      .regex(strongPassword, {
        message: 'Password must have small and capital letter, number and a special character.',
      }),
    passwordConfirm: zod.string().trim().min(1),
  })
  .superRefine(({ passwordConfirm, password }, context) => {
    if (passwordConfirm !== password) {
      context.addIssue({
        code: zod.ZodIssueCode.custom,
        message: 'Passwords must be same',
        path: ['passwordConfirm'],
      });
    }
  });

export default schema;
