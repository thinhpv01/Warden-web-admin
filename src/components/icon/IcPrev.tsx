import React, { SVGProps } from 'react';
type Props = {} & SVGProps<SVGSVGElement>;
export default function IcPrev(props: Props) {
    return (
        <svg width="4" height="8" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M3.57322 0.426751L0.176784 3.82323C0.0791539 3.92086 0.0791539 4.07915 0.176784 4.17678L3.57322 7.57317C3.73072 7.73067 4 7.61917 4 7.39647V0.603531C4 0.380801 3.73071 0.269261 3.57322 0.426751Z"
                fill="black"
            />
        </svg>
    );
}
