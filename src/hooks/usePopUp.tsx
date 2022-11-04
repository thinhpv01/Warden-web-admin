import { DialogActionsProps, DialogProps } from '@mui/material';
import { ReactNode } from 'react';
import { useBoolean } from 'usehooks-ts';

export type IPopUp = {
    open: boolean;
    onClose?(): void;
    onConfirm?: () => any;
    dialogProps?: Omit<DialogProps, 'open' | 'onClose'>;
    dialogActionsProps?: DialogActionsProps;
    customActions?: ReactNode;
    hideConfirm?: boolean;
    hideClose?: boolean;
};

type Props = {
    onConfirm?(): void;
};

export default function usePopUp(props?: boolean | Props) {
    const popUp = useBoolean(typeof props == 'boolean' ? props : undefined);
    return {
        setTrue: popUp.setTrue,
        open: popUp.value,
        onClose: popUp.setFalse,
        onConfirm: typeof props != 'boolean' ? props?.onConfirm : undefined,
    };
}
