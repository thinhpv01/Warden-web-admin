import { InteractionRequiredAuthError, InteractionStatus } from '@azure/msal-browser';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Box, Container, CssBaseline, Toolbar } from '@mui/material';
import React from 'react';
import { Outlet } from 'react-router-dom';
import axiosInstant from 'src/helpers/axiosHelper';
import useSWR from 'swr';
import AppBar from './AppBar';
import { Loading } from './Loading';
import NavBar from './NavBar';
import UnAuth from './UnAuth';

function AuthLayout() {
    const isAuthenticated = useIsAuthenticated();
    console.log(`isAuthenticated`, isAuthenticated);
    const { instance, inProgress, logger, accounts } = useMsal();

    const accessTokenRequest = {
        scopes: ['user.read'],
        account: accounts[0],
    };

    const getToken = async () => {
        try {
            console.log('Getting access token...');
            const accessTokenResponse = await instance.acquireTokenSilent(accessTokenRequest);
            const accessToken = accessTokenResponse.idToken;

            axiosInstant.interceptors.request.use(
                (config) => {
                    config.headers!['Authorization'] = 'Bearer ' + accessToken;
                    return config;
                },
                (error) => Promise.reject(error)
            );

            return accessToken;
        } catch (error: any) {
            console.error(error);
            return Promise.reject(error);
        }
    };

    const shouldFetch = isAuthenticated;
    console.log(`shouldFetch`, shouldFetch);

    const {
        data: accessToken,
        error,
        isValidating,
    } = useSWR(shouldFetch ? 'api/requiredToken' : null, getToken, {
        refreshInterval: 30 * 60 * 1000,
        revalidateOnFocus: false,
        refreshWhenOffline: true,
        shouldRetryOnError: false,
        onError(err, key, config) {
            console.log('have error');
            console.error(error);
            if (err instanceof InteractionRequiredAuthError) {
                instance.acquireTokenRedirect(accessTokenRequest);
            }
        },
    });

    // const loading = ![InteractionStatus.None, InteractionStatus.SsoSilent].includes(inProgress);
    const gettingToken = !accessToken && !error;

    if (isAuthenticated && gettingToken) {
        return <Loading />;
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <AuthenticatedTemplate>
                <CssBaseline />

                <AppBar />

                <NavBar />

                <Container maxWidth={false} sx={{ pt: 5, px: '56px !important' }}>
                    <Toolbar />
                    <Outlet />
                </Container>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <UnAuth />
            </UnauthenticatedTemplate>
        </Box>
    );
}

export default React.memo(AuthLayout);
