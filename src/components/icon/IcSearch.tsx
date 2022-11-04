import React, { SVGProps } from "react";
type Props = {} & SVGProps<SVGSVGElement>;
export default function IcSearch(props: Props) {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <circle
                cx="6.88398"
                cy="6.83739"
                r="6.08739"
                stroke="#85858A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M11.9999 12.0465L13.9534 14"
                stroke="#85858A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
