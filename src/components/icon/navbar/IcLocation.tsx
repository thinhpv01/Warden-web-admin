import { SvgIconProps } from '@mui/material';
import React from 'react';

export default function IcLocation(props: SvgIconProps) {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7.25 14.7812C7.25 14.7712 7.25 14.76 7.25 14.75C7.25 9.92125 11.1713 6 16 6C20.8287 6 24.75 9.92125 24.75 14.75C24.75 14.76 24.75 14.7712 24.75 14.7812C24.73 21.32 18.4375 25.2225 16.4488 25.9175C16.3162 25.9638 16.1575 26 16 26C15.8425 26 15.6912 25.97 15.5512 25.9175C13.5625 25.2225 7.27 21.32 7.25 14.7812ZM16 11C18.07 11 19.75 12.68 19.75 14.75C19.75 16.82 18.07 18.5 16 18.5C13.93 18.5 12.25 16.82 12.25 14.75C12.25 12.68 13.93 11 16 11Z"
                fill="currentColor"
            />
        </svg>
    );
}
