import {BriefcaseBusiness, Handshake} from 'lucide-react-native'
import {siTelegram} from 'simple-icons'
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

const convertStringToIcon = (iconName?: string) => {
    switch (iconName) {
        case 'BriefcaseBusiness':
            return <BriefcaseBusiness />
        case 'Handshake':
            return <Handshake />
        case 'Telegram':
            return <SimpleIcon icon={siTelegram} />
        default:
            return null;
    }
};

export {convertStringToIcon};