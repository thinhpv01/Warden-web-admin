import { Stack, Typography } from '@mui/material';
import { WardenWithRelations } from '@WardenOps/model';
import React from 'react';
import { TiWarningOutline } from 'react-icons/ti';
import color from 'src/theme/color';

type Props = { option: WardenWithRelations };

export default function SelectOption({ option }: Props) {
    // console.log(`option`, option);
    return (
        <Stack
            direction={'row'}
            sx={{
                py: 1,
                borderBottom: '1px solid #eee',
                minHeight: '55px',
                alignItems: 'center',
            }}
        >
            <Stack flex={1}>
                <Typography>{option.FullName}</Typography>
            </Stack>
        </Stack>
    );
}
