import { useMsal } from '@azure/msal-react';
import { AZURE_ID } from '@helpers';
import React, { useEffect } from 'react';

export default function Logout() {
    const { instance, accounts } = useMsal();

    const handleLogout = () => {
        instance
            .logoutRedirect({
                postLogoutRedirectUri: '/',
            })
            .then((res) => {
                sessionStorage.removeItem(AZURE_ID);
            });
    };

    useEffect(() => {
        handleLogout();
    }, []);

    return null;
}
