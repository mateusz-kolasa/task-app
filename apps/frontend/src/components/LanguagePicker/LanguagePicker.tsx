import { Center, Combobox, InputBase, useCombobox } from '@mantine/core'
import i18next from 'i18next'
import { GBFlag, PLFlag } from 'mantine-flagpack'
import { useState } from 'react'

const languages = [
  {
    value: 'en',
    Icon: GBFlag,
  },
  {
    value: 'pl',
    Icon: PLFlag,
  },
]

function LanguagePicker() {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const [value, setValue] = useState<string>(i18next.language)
  const SelectedIcon =
    languages.find(language => language.value === value)?.Icon ?? languages[0].Icon

  const handleLanguageChange = (newValue: string) => {
    if (newValue !== value) {
      i18next.changeLanguage(newValue)
      setValue(newValue)
    }
    combobox.closeDropdown()
  }

  return (
    <Center>
      <Combobox store={combobox} onOptionSubmit={handleLanguageChange}>
        <Combobox.Target>
          <InputBase
            component='button'
            type='button'
            pointer
            rightSection={<Combobox.Chevron />}
            rightSectionPointerEvents='none'
            onClick={() => combobox.toggleDropdown()}
          >
            <SelectedIcon w={30} display='flex' />
          </InputBase>
        </Combobox.Target>
        <Combobox.Dropdown>
          <Combobox.Options>
            {languages.map(language => (
              <Combobox.Option value={language.value} key={language.value}>
                {<language.Icon w={30} display='flex' />}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Center>
  )
}

export default LanguagePicker
