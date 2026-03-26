import * as LucideIcons from 'lucide-react-native'
import {siFacebook, siGithub, siSubstack, siTelegram, siWhatsapp, siX} from 'simple-icons'
import Svg, {Path} from "react-native-svg";

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

const convertStringToIcon = (iconName?: string, size?: number, color?: string) => {
    if (!iconName) return null;

    const simpleIcon = simpleIconMap[iconName.toLowerCase()];
    if (simpleIcon) return <SimpleIcon icon={simpleIcon} size={size} color={color} />;

    // Dynamic lucide lookup — name must be PascalCase (e.g. "BriefcaseBusiness")
    const LucideIcon = (LucideIcons as any)[iconName];
    if (LucideIcon) return <LucideIcon size={size} color={color} />;

    return null;
};

export {convertStringToIcon};