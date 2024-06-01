import { DEFAULT_THEME, createTheme, mergeMantineTheme } from '@mantine/core';

const themeOverride = createTheme({});

export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
