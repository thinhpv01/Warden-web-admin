export type FeatureName =
    | 'rota-coverage'
    | 'rota-static'
    | 'rota-mobile'
    | 'dashboard'
    | 'report'
    | 'setting'
    | 'setting-warden'
    | 'setting-location'
    | 'setting-cluster'
    | 'lieu-leave';
export type Role = 'admin' | 'region-manager';

export type FeatureOptions = {
    active: boolean;
    roles?: Role[];
};

export const featureFlags: Record<FeatureName, FeatureOptions> = {
    // Admin can using all feature without define role by default
    // If not define role, the feature will be available to all
    'rota-coverage': {
        active: process.env.REACT_APP_ROTA_COVERAGE !== 'false',
    },
    'rota-static': {
        active: process.env.REACT_APP_ROTA_STATIC !== 'false',
    },
    'rota-mobile': {
        active: process.env.REACT_APP_ROTA_MOBILE !== 'false',
    },
    dashboard: {
        active: process.env.REACT_APP_DASHBOARD !== 'false',
    },
    report: {
        active: process.env.REACT_APP_REPORT !== 'false',
    },
    setting: {
        active: process.env.REACT_APP_SETTING !== 'false',
    },
    'setting-location': {
        active: process.env.REACT_APP_SETTING_WARDEN !== 'false',
    },
    'setting-warden': {
        active: process.env.REACT_APP_SETTING_LOCATION !== 'false',
    },
    'setting-cluster': {
        active: process.env.REACT_APP_SETTING_CLUSTER !== 'false',
    },
    'lieu-leave': {
        active: process.env.REACT_APP_LIEU_LEAVE_APPROVALS !== 'false',
    },
};
