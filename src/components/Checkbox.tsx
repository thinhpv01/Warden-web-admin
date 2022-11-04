import { Checkbox as MuiCheckbox, CheckboxProps, SvgIconProps } from '@mui/material';
import React from 'react';

type Props = {};

export function UncheckedIcon(props: SvgIconProps) {
    return (
        <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M16 2.75H8C5.10051 2.75 2.75 5.10051 2.75 8V16C2.75 18.8995 5.10051 21.25 8 21.25H16C18.8995 21.25 21.25 18.8995 21.25 16V8C21.25 5.10051 18.8995 2.75 16 2.75Z"
                stroke="#85858A"
                strokeWidth="1.5"
            />
        </svg>
    );
}

export function CheckedIcon(props: SvgIconProps) {
    return (
        <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M16 2.75H8C5.10051 2.75 2.75 5.10051 2.75 8V16C2.75 18.8995 5.10051 21.25 8 21.25H16C18.8995 21.25 21.25 18.8995 21.25 16V8C21.25 5.10051 18.8995 2.75 16 2.75Z"
                stroke="#009D4F"
                strokeWidth="1.5"
            />
            <path
                d="M9 12L11 14L15 10"
                stroke="#009D4F"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default function Checkbox(props: CheckboxProps) {
    return (
        <MuiCheckbox
            sx={{
                '& input:disabled ~ svg': {
                    fill: '#ddd',
                },
            }}
            icon={<UncheckedIcon fontSize="small" />}
            checkedIcon={<CheckedIcon fontSize="small" />}
            style={{ padding: 0 }}
            {...props}
        />
    );
}
