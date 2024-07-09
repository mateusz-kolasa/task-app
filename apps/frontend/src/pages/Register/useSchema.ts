import { useTranslation } from 'react-i18next'
import { z as zod } from 'zod'

export const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]{8,}$/

const useSchema = () => {
  const { t } = useTranslation()

  return zod
    .object({
      username: zod
        .string()
        .trim()
        .min(1, { message: t('username.validation.minLength') }),
      password: zod
        .string()
        .trim()
        .min(8, { message: t('password.validation.minLength') })
        .regex(strongPassword, {
          message: t('password.validation.strength'),
        }),
      passwordConfirm: zod.string().trim(),
    })
    .superRefine(({ passwordConfirm, password }, context) => {
      if (passwordConfirm !== password) {
        context.addIssue({
          code: zod.ZodIssueCode.custom,
          message: t('password.validation.different'),
          path: ['passwordConfirm'],
        })
      }
    })
}

export default useSchema
