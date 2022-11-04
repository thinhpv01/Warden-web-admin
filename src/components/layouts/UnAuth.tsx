import { useMsal } from '@azure/msal-react';
import { loginRequest } from '@config';
import { useLayoutEffect } from 'react';
import { Loading } from './Loading';

type Props = {};

export default function UnAuth({}: Props) {
    const { instance } = useMsal();

    useLayoutEffect(() => {
        instance.loginRedirect(loginRequest).catch((e) => {
            console.error(e);
        });
    }, []);

    return <Loading />;
}
