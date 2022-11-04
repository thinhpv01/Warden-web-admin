import { SvgIconProps } from '@mui/material';
import * as React from 'react';

function IcRemove(props: SvgIconProps) {
    return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            <path
                d="M12.986 6.22s-.381 4.734-.603 6.727c-.105.952-.693 1.51-1.657 1.528-1.833.033-3.669.035-5.501-.003-.927-.02-1.506-.585-1.609-1.52-.223-2.011-.602-6.731-.602-6.731M13.959 3.952H2.042M11.662 3.952c-.551 0-1.027-.39-1.135-.93l-.17-.855a.9.9 0 00-.87-.667H6.513a.9.9 0 00-.87.667l-.17.854c-.109.54-.584.93-1.135.93"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export default IcRemove;
