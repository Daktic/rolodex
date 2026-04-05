export const base = {
    colors: {
        background: '#F5F5F5',
        surface: '#FFFFFF',
        surfaceAlt: '#F0F0F0',
        text: {
            primary: '#000000',
            secondary: '#6D6D72',
            tertiary: '#999999',
            disabled: '#AAAAAA',
            inverse: '#FFFFFF',
        },
        iconColor: '#000000',
        border: '#C6C6C8',
        borderAlt: '#E0E0E0',
        accent: '#007AFF',
        danger: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        highlight: '#DAA520',
        overlay: 'rgba(0, 0, 0, 0.5)',
        shadow: '#000000',
        placeholder: '#999999',
        tabBar: {
            background: '#FFFFFF',
            active: '#007AFF',
            inactive: '#8E8E93',
            border: '#E0E0E0',
        },
        status: {
            info: { text: '#007AFF', background: '#F0F8FF' },
            pending: { text: '#FF9500', background: '#FFF8F0' },
            active: { text: '#34C759', background: '#F0FFF4' },
            error: { text: '#FF3B30', background: '#FFF0F0' },
            neutral: { text: '#8E8E93', background: '#F8F8F8' },
        },
    },
};

export type Theme = typeof base;

export type DeepPartial<T> = {
    [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type ThemeOverride = DeepPartial<Theme>;
