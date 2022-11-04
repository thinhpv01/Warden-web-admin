import { CStack } from '@components/FlexedStack';
import { rotaController, wardenController } from '@controllers';
import { Location, RotaCoverage } from '@LocationOps/model';
import { CloseRounded } from '@mui/icons-material';
import {
    Avatar,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { ShiftRota } from '@pages/rota-coverage/hooks/useRota';
import { Rota, Warden, WardenWithRelations } from '@WardenOps/model';
import { uniq } from 'lodash';
import moment from 'moment';
import { useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';
import { IPopUp } from 'src/hooks/usePopUp';
import PopUpBase from '../PopUpBase';
import ShiftRange from './ShiftRange';

type Props<T> = Omit<IPopUp, 'onConfirm'> & {
    location: Location;
    shift: T;
    onConfirm(rota: RotaCoverage[]): void;
};

export default function PopUpEditCalendar<T extends ShiftRota>(props: Props<T>) {
    console.log(`props`, props.shift);
    const [state, setState] = useState<T>(props.shift);
    const [deleted, setDeleted] = useState<number[]>([]);
    console.log(`state`, state);
    const startId = useId();

    const full = state.rota?.Missing === 0;

    const handleRemoveWarden = (warden: Warden) => {
        setDeleted((prev) => [...prev, warden.Id!]);
        setState((prev) => {
            const wardens = prev.rota?.Wardens?.filter((w) => w.Id !== warden.Id) || [];
            const required = prev.rota?.RequireWarden || 0;
            const missing = wardens.length >= required ? 0 : required - wardens.length;

            return {
                ...prev,
                rota: {
                    ...prev.rota,
                    Wardens: wardens,
                    Missing: missing,
                },
            };
        });
    };

    const [wardens, setWardens] = useState<WardenWithRelations[]>([]);

    useEffect(() => {
        if (props.open) {
            setState(props.shift);

            if (!props.shift.date) return;
            wardenController
                .getWardenActualWeekWorkHour({
                    TimeFrom: props.shift.date,
                    WardenIds: uniq(props.shift.assignedWardens?.map((w) => w.Id)) || [],
                })
                .then(setWardens);
        }
    }, [props.open, props.shift]);

    const handleConfirm = async () => {
        const rotas = deleted.map((wardenId) => {
            console.log('props.shift.date', props.shift.date);
            return {
                WardenId: wardenId,
                TimeFrom: moment(props.shift.date).hour(props.shift.start).toDate(),
                TimeTo: moment(props.shift.date).hour(props.shift.end).toDate(),
                LocationId: props.location.Id!,
            } as Rota;
        });
        console.log(`rotas`, rotas);

        try {
            const res = await rotaController.bulkDeleteByLocation({ LocationId: props.location.Id!, List: rotas });
            props.onConfirm(res);
            setDeleted([]);
            toast.success('Save successfully!');
        } catch (error) {
            toast.success('Server error!');
        }

        // console.log(`res`, res);
    };

    return (
        <PopUpBase
            {...props}
            dialogProps={{ maxWidth: 'sm', fullWidth: true, PaperProps: { sx: { maxWidth: '700px' } } }}
            title={`Edit calendar on ${moment(props.shift.date).format('dddd, DD/MM/YYYY')}`}
            subTitle={`Location: ${props.location.Name}`}
            onConfirm={handleConfirm}
            desc={
                <Stack spacing={3}>
                    <CStack justifyContent="space-between">
                        <ShiftRange disabled value={{ start: props.shift.start, end: props.shift.end }} />
                        <Stack
                            sx={{
                                bgcolor: full ? 'primary.light' : 'warning.main',
                                px: 2,
                                borderRadius: (theme) => theme.shape.borderRadius + 'px',
                            }}
                        >
                            <Typography color={full ? 'primary.main' : 'error.main'} sx={{ lineHeight: '40px' }}>
                                {`Missing: ${state.rota?.Missing}(${props.shift.rota?.RequireWarden})`}
                            </Typography>
                        </Stack>
                    </CStack>

                    <Stack>
                        <TableContainer>
                            <Table
                                sx={{
                                    '& th, td': {
                                        padding: 1,
                                    },
                                }}
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Warden</TableCell>
                                        <TableCell>Actual hours</TableCell>
                                        <TableCell>Contracted hours</TableCell>
                                        <TableCell align="right"></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {state.rota?.Wardens?.map((w) => (
                                        <TableRow key={w.Id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell>
                                                <CStack justifyContent={'flex-start'} spacing={1} width="180px">
                                                    <Avatar src={w.Picture}>
                                                        {w.FullName?.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Typography>{w.FullName}</Typography>
                                                </CStack>
                                            </TableCell>
                                            <TableCell>
                                                {wardens.find((wd) => wd.Id === w.Id)?.ActualWeekWorkHour ?? 0}
                                                {'(h)'}
                                            </TableCell>
                                            <TableCell>
                                                {wardens.find((wd) => wd.Id === w.Id)?.ContractHours ?? 0}
                                                {'(h)'}
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveWarden(w)}
                                                >
                                                    <CloseRounded />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                </Stack>
            }
        />
    );
}
