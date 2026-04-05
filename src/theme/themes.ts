import { base, type Theme, type ThemeOverride } from './themes/base';
import { light } from './themes/light';
import { dark } from './themes/dark';
import { highContrast } from './themes/highContrast';
import { rolodex } from './themes/rolodex';
import type { ColorSchemeName } from 'react-native';
import {ThemeOption} from "@/types/settings";


function mergeTheme(override: ThemeOverride): Theme {
    const oc = override.colors ?? {};
    return {
        ...base,
        ...override,
        colors: {
            ...base.colors,
            ...oc,
            text: { ...base.colors.text, ...(oc.text ?? {}) },
            tabBar: { ...base.colors.tabBar, ...(oc.tabBar ?? {}) },
            status: {
                info: { ...base.colors.status.info, ...(oc.status?.info ?? {}) },
                pending: { ...base.colors.status.pending, ...(oc.status?.pending ?? {}) },
                active: { ...base.colors.status.active, ...(oc.status?.active ?? {}) },
                error: { ...base.colors.status.error, ...(oc.status?.error ?? {}) },
                neutral: { ...base.colors.status.neutral, ...(oc.status?.neutral ?? {}) },
            },
        },
    };
}

export function resolveTheme(selected: ThemeOption, systemScheme?: ColorSchemeName): Theme {
    if (selected === 'light') return mergeTheme(light);
    if (selected === 'dark') return mergeTheme(dark);
    if (selected === 'highContrast') return mergeTheme(highContrast);
    if (selected === 'rolodex') return mergeTheme(rolodex);
    return systemScheme === 'dark' ? mergeTheme(dark) : mergeTheme(light);
}
