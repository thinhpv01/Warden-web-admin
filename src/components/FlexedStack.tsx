import { Stack, StackProps } from '@mui/material';
import React from 'react';

type Props = {};

function CStack(props: StackProps) {
    return <Stack direction={'row'} justifyContent="center" alignItems={'center'} {...props} />;
}

function VStack(props: StackProps) {
    return <Stack direction={'column'} justifyContent="center" {...props} />;
}

function HStack(props: StackProps) {
    return <Stack direction={'row'} justifyContent="center" {...props} />;
}

export { CStack, VStack, HStack };
