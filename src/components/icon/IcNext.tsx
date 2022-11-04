import React, { SVGProps } from 'react';

type Props = {} & SVGProps<SVGSVGElement>;
export default function IcNext(props: Props) {
    return (
        <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M0.42678 0.426751L3.82322 3.82323C3.92085 3.92086 3.92085 4.07915 3.82322 4.17678L0.42678 7.57317C0.26928 7.73067 0 7.61917 0 7.39647V0.603531C0 0.380801 0.26929 0.269261 0.42678 0.426751Z"
                fill="black"
            />
        </svg>
    );
}
