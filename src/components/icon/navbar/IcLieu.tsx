import { SvgIconProps } from '@mui/material';
import React from 'react';

export default function IcLieu(props: SvgIconProps) {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.9999 20.9705C20.7932 20.9705 23.0107 20.3556 23.2249 17.8874C23.2249 15.421 21.6789 15.5796 21.6789 12.5533C21.6789 10.1895 19.4383 7.5 15.9999 7.5C12.5615 7.5 10.3209 10.1895 10.3209 12.5533C10.3209 15.5796 8.7749 15.421 8.7749 17.8874C8.98991 20.3649 11.2074 20.9705 15.9999 20.9705Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M18.0305 23.5287C16.871 24.8162 15.0622 24.8315 13.8916 23.5287"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
