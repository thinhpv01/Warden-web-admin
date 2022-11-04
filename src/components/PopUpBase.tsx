import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
    TypographyProps,
} from '@mui/material';
import { ReactNode } from 'react';
import { IPopUp } from 'src/hooks/usePopUp';

type Props = IPopUp & {
    title?: ReactNode;
    subTitle?: ReactNode;
    desc: ReactNode;
    fixOverflow?: boolean;
    minWidthButton?: number;
    subTitleProps?: TypographyProps;
    hideTitle?: boolean;
};

export default function PopUpBase(props: Props) {
    return (
        <Dialog {...props.dialogProps} open={props.open}>
            {!props.hideTitle && (
                <DialogTitle component={Stack} sx={{ textAlign: 'center' }}>
                    {typeof props.title === 'string' ? (
                        <Typography variant="h4">{props.title}</Typography>
                    ) : (
                        props.title
                    )}

                    {typeof props.subTitle === 'string' ? (
                        <Typography color={'primary'} variant="body2" {...props.subTitleProps}>
                            {props.subTitle}
                        </Typography>
                    ) : (
                        props.subTitle
                    )}
                </DialogTitle>
            )}
            <DialogContent sx={{ overflowY: props.fixOverflow ? 'unset' : undefined }}>{props.desc}</DialogContent>
            {!(props.hideClose && props.hideConfirm) && (
                <DialogActions
                    {...props.dialogActionsProps}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        '& button': {
                            minWidth: props.minWidthButton || 200,
                        },
                        px: 3,
                        pb: 3,
                        ...props.dialogActionsProps?.sx,
                    }}
                >
                    {props.customActions ? (
                        props.customActions
                    ) : (
                        <>
                            {!props.hideClose && (
                                <Button variant="cancel" onClick={props.onClose}>
                                    Close
                                </Button>
                            )}
                            {!props.hideConfirm && (
                                <Button variant="contained" onClick={props.onConfirm}>
                                    Submit
                                </Button>
                            )}
                        </>
                    )}
                </DialogActions>
            )}
        </Dialog>
    );
}
