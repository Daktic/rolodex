import type {ThemeOverride} from "@/theme/themes/base";

export const rolodex: ThemeOverride = {
    colors: {
        background: '#F5EDD6',      // warm wheat card stock
        surface: '#FDF6E3',         // cream card stock
        surfaceAlt: '#EDE0C4',      // aged card stock
        text: {
            primary: '#2C1810',     // deep sepia ink
            secondary: '#6B4226',   // medium brown ink
            tertiary: '#9C6B4E',    // faded brown ink
            disabled: '#C4A882',    // very faded ink
            inverse: '#FDF6E3',     // cream on dark
        },
        iconColor: '#2C1810',
        border: '#8B5E3C',          // ink-quality brown
        borderAlt: '#C4956A',       // lighter ink line
        accent: '#8B3A0F',          // rusty orange-brown
        danger: '#A83226',          // deep red-brown
        warning: '#C4681C',         // burnt orange
        success: '#4A7C3F',         // muted period green
        highlight: '#C4681C',       // warm orange highlight
        overlay: 'rgba(44, 24, 16, 0.6)',
        shadow: '#2C1810',
        placeholder: '#9C6B4E',
        tabBar: {
            background: '#EDE0C4',  // aged card stock
            active: '#8B3A0F',      // rusty accent
            inactive: '#9C6B4E',    // faded ink
            border: '#8B5E3C',      // ink border
        },
        status: {
            info: { text: '#8B3A0F', background: '#FAF0D7' },
            pending: { text: '#C4681C', background: '#FAF0D7' },
            active: { text: '#4A7C3F', background: '#EFF5E8' },
            error: { text: '#A83226', background: '#F5E8E6' },
            neutral: { text: '#6B4226', background: '#EDE0C4' },
        },
    },
};
