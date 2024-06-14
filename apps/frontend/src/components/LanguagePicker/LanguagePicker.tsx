import { Combobox, InputBase, useCombobox } from '@mantine/core'
import i18next from 'i18next'
import { GBFlag, PLFlag } from 'mantine-flagpack'
import { useState } from 'react'
import classes from './LanguagePicker.module.css'

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
    <Combobox store={combobox} onOptionSubmit={handleLanguageChange}>
      <Combobox.Target>
        <InputBase
          component='button'
          type='button'
          pointer
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents='none'
          onClick={() => combobox.toggleDropdown()}
          classNames={{
            input: classes.input,
          }}
        >
          <SelectedIcon w={30} display='flex' />
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown classNames={{ dropdown: classes.dropdown }}>
        <Combobox.Options>
          {languages.map(language => (
            <Combobox.Option value={language.value} key={language.value} className={classes.option}>
              {<language.Icon w={30} display='flex' />}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

export default LanguagePicker
