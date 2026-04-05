import * as LucideIcons from 'lucide-react-native'
import {siFacebook, siGithub, siSubstack, siTelegram, siWhatsapp, siX} from 'simple-icons'
import Svg, {Path} from "react-native-svg";
import {useTheme} from "@/hooks/useTheme";

const SimpleIcon = ({icon, size = 24, color = 'black'}: {icon: any, size?: number, color?: string}) => {
    return <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
    >
        <Path d={icon.path} />
    </Svg>
}



// Simple icons must stay explicit since they have no namespace export
const simpleIconMap: Record<string, any> = {
    telegram: siTelegram,
    x: siX,
    whatsapp: siWhatsapp,
    github: siGithub,
    facebook: siFacebook,
    substack: siSubstack,
};

const mapCommonNames = (iconName:string) => {
    switch (iconName.toLowerCase()) {
        case 'website':
            return 'Globe';
        case 'avoid':
            return 'Ban';
        default:
            return iconName;
    }
};

const convertLucideIcons = (iconName: string, size?: number, color?: string) => {
    // If the name is for a specific mapped value, override the name
    // This is used for names like website that should populate a globe.
    const mappedName = mapCommonNames(iconName);
    const LucideIcon = (LucideIcons as any)[mappedName];
    if (LucideIcon) return <LucideIcon size={size} color={color} />;
    return null
};

const convertStringToIcon = (iconName?: string, size?: number, color?: string) => {
    if (!iconName) return null;
    const { theme } = useTheme();
    const resolvedColor = color ?? theme.colors.iconColor;

    const simpleIcon = simpleIconMap[iconName.toLowerCase()];
    if (simpleIcon) return <SimpleIcon icon={simpleIcon} size={size} color={resolvedColor} />;

    // Dynamic lucide lookup — name must be PascalCase (e.g. "BriefcaseBusiness")
    return convertLucideIcons(iconName, size, resolvedColor);
};

export {convertStringToIcon};