import {BriefcaseBusiness, Handshake} from 'lucide-react-native'

const convertStringToIcon = (iconName?: string) => {
    switch (iconName) {
        case 'BriefcaseBusiness':
            return <BriefcaseBusiness />
        case 'Handshake':
            return <Handshake />
        default:
            return null;
    }
};

export {convertStringToIcon};