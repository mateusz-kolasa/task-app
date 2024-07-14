import { useTranslation } from 'react-i18next'
import { z as zod } from 'zod'

const useSchema = () => {
  const { t } = useTranslation()

  return zod.object({
    username: zod
      .string()
      .trim()
      .min(1, { message: t('username.validation.minLength') }),

    password: zod
      .string()
      .trim()
      .min(1, { message: t('password.validation.minLength') }),
  })
}
export default useSchema
