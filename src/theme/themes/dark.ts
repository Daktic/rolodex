import type { ThemeOverride } from './base';

export const dark: ThemeOverride = {
    colors: {
        background: '#1C1C1E',
        surface: '#2C2C2E',
        surfaceAlt: '#3A3A3C',
        text: {
            primary: '#FFFFFF',
            secondary: '#8E8E93',
            tertiary: '#636366',
            disabled: '#48484A',
            inverse: '#000000',
        },
        border: '#38383A',
        borderAlt: '#48484A',
        accent: '#0A84FF',
        danger: '#FF453A',
        warning: '#FF9F0A',
        success: '#32D74B',
        highlight: '#DAA520',
        overlay: 'rgba(0, 0, 0, 0.7)',
        shadow: '#000000',
        placeholder: '#636366',
        tabBar: {
            background: '#1C1C1E',
            active: '#0A84FF',
            inactive: '#636366',
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
