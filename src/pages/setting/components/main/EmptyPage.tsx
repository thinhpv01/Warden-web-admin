import { Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
type Props = {
    title?: string;
    subTitle?: ReactNode;
};
export default function EmptyPage(props: Props) {
    return (
        <Stack width="100%" height={320} alignItems="center" justifyContent="center">
            <Typography variant="h2" fontWeight={400} color="secondary">
                {props.title ? props.title : 'No results found'}
            </Typography>
            <Typography variant="h6" fontWeight={400} align="center">
                {props.subTitle ? (
                    props.subTitle
                ) : (
                    <>
                        We couldn't find what searched for. <br />
                        Try searching again.
                    </>
                )}
            </Typography>
        </Stack>
    );
}
