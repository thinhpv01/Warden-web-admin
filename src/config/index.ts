import { featureFlags } from './featureFlag';

export * from './auth';
export * from './featureFlag';

export const appConfig = {
    publicUrl: process.env.REACT_APP_PUBLIC_URL || '',
    gateway: {
        serviceUrl: process.env.REACT_APP_SERVICE_URL || '',
    },
    googleMapApiKey: 'AIzaSyCeR7YV7SU_0rjZgzMA-5tl3HO1brNH3q4',
    featureFlags: featureFlags,
};
console.log(`appConfig`, appConfig);
