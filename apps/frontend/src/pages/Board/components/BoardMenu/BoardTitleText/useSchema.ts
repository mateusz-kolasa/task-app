import { useTranslation } from 'react-i18next'
import { z as zod } from 'zod'

const useSchema = () => {
  const { t } = useTranslation()

  return zod.object({
    title: zod
      .string()
      .trim()
      .min(1, { message: t('title.validation.minLength') }),
  })
}

export default useSchema
