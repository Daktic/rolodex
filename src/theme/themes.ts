import { base, type Theme } from './themes/base';
import { light } from './themes/light';
import { dark } from './themes/dark';
import type { ColorSchemeName } from 'react-native';

export type ThemeOption = 'system' | 'light' | 'dark';

function mergeTheme(override: Partial<Theme>): Theme {
    return {
        ...base,
        ...override,
        colors: {
            ...base.colors,
            ...(override.colors ?? {}),
            text: {
                ...base.colors.text,
                ...(override.colors?.text ?? {}),
            },
        },
    };
}

export function resolveTheme(selected: ThemeOption, systemScheme?: ColorSchemeName): Theme {
    if (selected === 'light') return mergeTheme(light);
    if (selected === 'dark') return mergeTheme(dark);
    // system: follow device preference, default to light
    return systemScheme === 'dark' ? mergeTheme(dark) : mergeTheme(light);
}
