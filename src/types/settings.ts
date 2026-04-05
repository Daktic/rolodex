export interface SettingsItem {
    id: string;
    title: string;
    onPress: () => void;
}

export enum ThemeOption {
    LIGHT = 'light',
    DARK = 'dark',
    SYSTEM = 'system',
    HIGH_CONTRAST = 'highContrast',
    ROLODEX = 'rolodex',
    BUBBLE_GUM = 'bubbleGum',
}