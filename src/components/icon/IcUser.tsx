import { SvgIconProps } from '@mui/material';
import React from 'react';

function IcUser(props: SvgIconProps) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="20" fill="none" viewBox="0 0 14 20" {...props}>
            <path
                stroke="#fff"
                strokeWidth="1.5"
                d="M10.25 4.75a3.25 3.25 0 11-6.5 0 3.25 3.25 0 016.5 0zM13.25 14.25c0 1.076-.61 2.12-1.736 2.925C10.388 17.98 8.794 18.5 7 18.5c-1.795 0-3.388-.52-4.514-1.325C1.36 16.37.75 15.325.75 14.25c0-1.076.61-2.12 1.736-2.925C3.612 10.52 5.206 10 7 10c1.795 0 3.388.52 4.514 1.325 1.127.805 1.736 1.85 1.736 2.925z"
            ></path>
        </svg>
    );
}

export default IcUser;
