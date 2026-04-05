import { createContext, useEffect, useState, type ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveTheme } from '@/theme/themes';
import type { Theme } from '@/theme/themes/base';
import {ThemeOption} from "@/types/settings";

const STORAGE_KEY = '@theme_preference';

interface ThemeContextValue {
    theme: Theme;
    selectedTheme: ThemeOption;
    setSelectedTheme: (option: ThemeOption) => Promise<void>;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [selectedTheme, setSelectedThemeState] = useState<ThemeOption>(ThemeOption.SYSTEM);
    const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

    // Load persisted preference on mount
    useEffect(() => {
        AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
            if (stored && (Object.values(ThemeOption) as string[]).includes(stored)) {
                setSelectedThemeState(stored as ThemeOption);
            }
        });
    }, []);

    // Track system scheme changes
    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemScheme(colorScheme);
        });
        return () => sub.remove();
    }, []);

    async function setSelectedTheme(option: ThemeOption) {
        setSelectedThemeState(option);
        await AsyncStorage.setItem(STORAGE_KEY, option);
    }

    const theme = resolveTheme(selectedTheme, systemScheme?? 'light');

    return (
        <ThemeContext.Provider value={{ theme, selectedTheme, setSelectedTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
