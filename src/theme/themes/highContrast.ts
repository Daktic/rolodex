import type { ThemeOverride } from './base';

export const highContrast: ThemeOverride = {
    colors: {
        background: '#000000',
        surface: '#1C1C1E',
        surfaceAlt: 'rgb(39 39 39 / 0.7)',
        text: {
            primary: '#FFFFFF',
            secondary: '#FFFFFF',
            tertiary: '#FFFFFF',
            disabled: '#FFFFFF',
            inverse: '#000000',
        },
        iconColor: '#FFFFFF',
        border: '#FFFF00',
        borderAlt: '#FFFFFF',
        accent: '#FFFF00',
        danger: '#FF453A',
        warning: '#FF9F0A',
        success: '#32D74B',
        highlight: '#DAA520',
        overlay: 'rgb(255 255 255 / 0.9)',
        shadow: '#000000',
        placeholder: '#636366',
        tabBar: {
            background: '#1C1C1E',
            active: '#FFFF00',
            inactive: '#8E8E93',
            border: '#38383A',
        },
        status: {
            info: { text: '#0A84FF', background: '#0D1E2E' },
            pending: { text: '#FF9F0A', background: '#2C2210' },
            active: { text: '#32D74B', background: '#0D2E18' },
            error: { text: '#FF453A', background: '#2E0D0C' },
            neutral: { text: '#636366', background: '#3A3A3C' },
        },
    },
};
