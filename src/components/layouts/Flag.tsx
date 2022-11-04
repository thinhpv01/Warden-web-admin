import { featureFlags, FeatureName, Role } from '@config';
import { ReactNode, useState } from 'react';
type Props = {
    name: FeatureName;
    children?: ReactNode;
    childrenOff?: ReactNode;
};

export const useFeatureFlag = () => {
    const userRole: Role = 'admin';

    const getActive = (featureName: FeatureName) => {
        const feature = featureFlags[featureName];

        if (!userRole) return false;
        if (!feature.active) return false;
        if (userRole !== 'admin' && !feature.roles?.includes(userRole)) return false;

        return true;
    };

    return {
        getActive,
    };
};

export default function Flag(props: Props) {
    const { getActive } = useFeatureFlag();

    if (!getActive(props.name)) return <></>;

    return <>{props.children}</>;
}
