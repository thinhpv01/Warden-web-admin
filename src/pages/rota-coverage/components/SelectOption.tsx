import { Stack, Typography } from '@mui/material';
import React from 'react';
import { TiWarningOutline } from 'react-icons/ti';
import color from 'src/theme/color';

type Props = { option: any; isDisplay?: boolean };

export default function SelectOption({ option, isDisplay = true }: Props) {
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
                <Typography>{option.Name}</Typography>
                {isDisplay && (
                    <Typography color="error" variant="body2" visibility={!option.MissingWarden ? 'hidden' : undefined}>
                        Require: {option.MissingWarden}
                    </Typography>
                )}
            </Stack>
            {isDisplay && (
                <Stack>
                    <Stack
                        sx={{
                            bgcolor: 'warning.main',
                            borderRadius: '50%',
                            p: '3px',
                            display: 'grid',
                            placeItems: 'center',
                            visibility: !option.MissingWarden ? 'hidden' : undefined,
                        }}
                    >
                        <TiWarningOutline
                            color={color.error}
                            // sx={{ fontSize: "0.75rem" }}
                        />
                        {/* <IcRequireWarden /> */}
                    </Stack>
                </Stack>
            )}
        </Stack>
    );
}
