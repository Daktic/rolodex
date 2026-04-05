import type {ThemeOverride} from "@/theme/themes/base";

export const bubbleGum: ThemeOverride = {
    colors: {
        background: '#FFE4F0',      // soft pink cotton candy
        surface: '#FFF0F7',         // bubblegum white-pink
        surfaceAlt: '#FFCCE5',      // deeper bubblegum pink
        text: {
            primary: '#6B0B3A',     // deep berry
            secondary: '#B03070',   // hot pink-magenta
            tertiary: '#D4689A',    // medium pink
            disabled: '#F0AECE',    // pale pink
            inverse: '#FFFFFF',
        },
        iconColor: '#6B0B3A',
        border: '#F472B6',          // bright pink
        borderAlt: '#FBCFE8',       // light pink
        accent: '#EC4899',          // hot pink
        danger: '#BE185D',          // deep magenta-red
        warning: '#F97316',         // bright orange pop
        success: '#22C55E',         // candy green
        highlight: '#F0ABFC',       // lavender-pink pop
        overlay: 'rgba(107, 11, 58, 0.5)',
        shadow: '#BE185D',
        placeholder: '#D4689A',
        tabBar: {
            background: '#FFCCE5',  // bubblegum pink
            active: '#EC4899',      // hot pink
            inactive: '#D4689A',    // faded pink
            border: '#F472B6',
        },
        status: {
            info: { text: '#7C3AED', background: '#F5F0FF' },
            pending: { text: '#F97316', background: '#FFF4ED' },
            active: { text: '#16A34A', background: '#F0FDF4' },
            error: { text: '#BE185D', background: '#FDF2F8' },
            neutral: { text: '#B03070', background: '#FFE4F0' },
        },
    },
};