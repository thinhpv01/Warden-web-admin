import PopUpBase from '@components/PopUpBase';
import { IPopUp } from '@hooks/usePopUp';
import { Stack } from '@mui/material';
import StackBarLine from './StackBarLine';

type Props = IPopUp & {};

export default function PopupViewChart(props: Props) {
    return (
        <PopUpBase
            {...props}
            fixOverflow
            dialogProps={{
                scroll: 'paper',
                fullWidth: true,
                maxWidth: 'lg',
            }}
            onConfirm={() => {
                props.onConfirm?.();
            }}
            title="View working location on Monday"
            subTitle={`Location name: Frontend lv2 - Co`}
            hideConfirm
            dialogActionsProps={{ sx: { justifyContent: 'flex-end' } }}
            desc={
                <Stack mt={3} direction={'row'} spacing={3}>
                    <Stack flex={1}>
                        <StackBarLine />
                    </Stack>
                </Stack>
            }
        />
    );
}
