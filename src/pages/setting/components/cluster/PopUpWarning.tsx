import PopUpBase from '@components/PopUpBase';
import { IPopUp } from '@hooks/usePopUp';
import { Button, Stack, Typography } from '@mui/material';

type Props = IPopUp & {};

export default function PopUpWarning(props: Props) {
    return (
        <PopUpBase
            open={props.open}
            dialogProps={{ fullWidth: true, maxWidth: 'xs' }}
            onClose={props.onClose}
            onConfirm={() => {}}
            title={
                <Typography variant="h4" color="error">
                    Warning
                </Typography>
            }
            hideConfirm
            hideClose
            subTitleProps={{ sx: { color: 'gray' } }}
            minWidthButton={150}
            desc={
                <Stack mt={1} pb={0.5}>
                    <Typography textAlign={'center'}>
                        All locations will be deleted when changing region. Are you sure you want to change?
                    </Typography>

                    <Stack mt={3} direction={'row'} justifyContent="space-around">
                        <Button sx={{ minWidth: 130 }} variant="cancel" onClick={props.onClose}>
                            No
                        </Button>
                        <Button sx={{ minWidth: 130 }} variant="errorContained" onClick={props.onConfirm}>
                            Yes
                        </Button>
                    </Stack>
                </Stack>
            }
        />
    );
}
