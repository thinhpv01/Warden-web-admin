import PopUpBase from '@components/PopUpBase';
import { IPopUp } from '@hooks/usePopUp';
import { Location } from '@LocationOps/model';
import { Button, Chip, Stack, Typography } from '@mui/material';

type Props = IPopUp & {
    locations: Location[];
    onDelete(location: Location): void;
};

export default function PopUpViewMore(props: Props) {
    return (
        <PopUpBase
            open={props.open}
            dialogProps={{ fullWidth: true, maxWidth: 'xs' }}
            onClose={props.onClose}
            onConfirm={() => {}}
            title={'Selected locations'}
            hideConfirm
            hideClose
            subTitleProps={{ sx: { color: 'gray' } }}
            minWidthButton={150}
            desc={
                <Stack mt={1} pb={0.5}>
                    <Stack gap={1}>
                        {props.locations.map((l) => {
                            return (
                                <Chip label={l.Name} onDelete={() => props.onDelete(l)} sx={{ borderRadius: '5px' }} />
                            );
                        })}
                    </Stack>

                    <Stack mt={3} direction={'row'} justifyContent="space-around">
                        <Button sx={{ minWidth: 130 }} variant="cancel" onClick={props.onClose}>
                            Close
                        </Button>
                    </Stack>
                </Stack>
            }
        />
    );
}
