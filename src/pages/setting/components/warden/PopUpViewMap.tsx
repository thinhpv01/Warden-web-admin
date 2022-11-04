import PopUpBase from '@components/PopUpBase';
import { formatHour } from '@components/rota-table/Shift';
import FilterByDay from '@components/warden/FilterByDay';
import { IPopUp } from '@hooks/usePopUp';
import { Location } from '@LocationOps/model';
import {
    Box,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Warden } from '@WardenOps/model';
import { sample, upperFirst, values } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import EmptyPage from '../main/EmptyPage';
import { ShiftWithRota } from './components/CalendarAndSchedule';
import Map from './Map';
import { BaseHead } from './WardenDetails';

type Props = IPopUp & {
    allShifts: Record<string, ShiftWithRota[]>;
    weekday?: number;
    warden: Warden;
};

export default function PopUpViewMap(props: Props) {
    const [state, setState] = useState({
        startDate: moment().startOf('isoWeek').toDate(),
    });
    const [shifts, setShifts] = useState<ShiftWithRota[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    // const [warden, setWarden] = useState<Warden>({} as Warden);
    const newArr = values(props.allShifts);

    useEffect(() => {
        const startDate = moment().startOf('isoWeek').toDate();
        let date = !startDate
            ? undefined
            : moment(startDate)
                  .isoWeekday(props.weekday ?? 0)
                  .toDate();
        if (date && props.weekday === 0) {
            date = moment(date).add(1, 'week').toDate();
        }
        setState((p) => ({ ...p, startDate: date ?? new Date() }));
    }, [props.weekday, props.open]);

    useEffect(() => {
        const listFiltered = newArr.flat().filter((item) => {
            const itemDate = moment(item.date).format('DD/MM/YYYY');
            const startDate = moment(state.startDate).format('DD/MM/YYYY');
            if (itemDate === startDate) {
                return item;
            }
        });
        setShifts(listFiltered);
    }, [state.startDate, props.open]);

    useEffect(() => {
        const locations = shifts
            .map((item) => ({
                ...item.location,
                Latitude: sample([53.48190479376572, 53.482402780253864, 53.481789872976776]),
                Longitude: sample([357.7560147207744, -2.243084056996622, -2.2429767686360265]),
            }))
            .filter((item) => item.Name !== undefined);
        setLocations(locations as any);
        // setWarden({
        //     ...props.warden,
        //     Latitude: sample([53.48190479376572, 53.482402780253864, 53.481789872976776]),
        //     Longitude: sample([357.7560147207744, -2.243084056996622, -2.2429767686360265]),
        // });
    }, [shifts, state.startDate, props.open]);
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
            title={`View working route on ${moment(state.startDate).format('dddd')}`}
            subTitle={`Warden name: ${props.warden.FullName}`}
            hideConfirm
            dialogActionsProps={{ sx: { justifyContent: 'flex-end' } }}
            desc={
                <Stack>
                    <Stack direction={'row'} spacing={2} justifyContent="flex-end">
                        <FilterByDay
                            startDate={state.startDate}
                            onChange={(startDate) => {
                                setState((p) => ({ ...p, startDate }));
                            }}
                            hideEndDate
                        />
                    </Stack>

                    <Stack mt={3} direction={'row'} spacing={3}>
                        {shifts.length > 0 ? (
                            <>
                                <Stack flex={0.7}>
                                    <Map locations={locations} warden={props.warden} />
                                </Stack>
                                <Stack flex={0.3}>
                                    <TableContainer component={Box} sx={{ mt: 2 }}>
                                        <Table sx={{ minWidth: 500 }} aria-label="simple table">
                                            <TableHead>
                                                <TableRow>
                                                    <BaseHead
                                                        sx={{ pl: 0, color: (theme) => theme.palette.secondary.main }}
                                                        align="left"
                                                        title="Time"
                                                    />
                                                    <BaseHead align="left" title="Location" />
                                                    <BaseHead align="right" title="Type" />
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {shifts
                                                    .sort((a, b) => a.start - b.start)
                                                    .map((item, index) => {
                                                        return (
                                                            <TableRow key={index + 'z'}>
                                                                <TableCell sx={{ pl: 0 }}>
                                                                    <Typography variant="body1" color="secondary">
                                                                        <Typography variant="body1">{`${formatHour(
                                                                            item.start
                                                                        )} - ${formatHour(item.end)} `}</Typography>
                                                                    </Typography>
                                                                </TableCell>

                                                                <TableCell align="left">
                                                                    <Typography
                                                                        variant="body1"
                                                                        sx={{
                                                                            width: 220,
                                                                            display: '-webkit-box',
                                                                            WebkitBoxOrient: 'vertical',
                                                                            WebkitLineClamp: 1,
                                                                            overflow: 'hidden',
                                                                            wordBreak: 'break-word',
                                                                        }}
                                                                    >
                                                                        {item.location?.Address ?? 'Unassigned'}
                                                                    </Typography>
                                                                </TableCell>

                                                                <TableCell align="right">
                                                                    <Typography
                                                                        variant="body1"
                                                                        color={
                                                                            item.location?.LocationType === 'static'
                                                                                ? 'primary'
                                                                                : item.location?.LocationType ===
                                                                                  'mobile'
                                                                                ? '#F09453'
                                                                                : 'inherit'
                                                                        }
                                                                    >
                                                                        {item.location
                                                                            ? upperFirst(item.location?.LocationType)
                                                                            : 'Unknown'}
                                                                    </Typography>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Stack>
                            </>
                        ) : (
                            <EmptyPage
                                title="No results for working route on this day."
                                subTitle={
                                    <>
                                        We couldn't find what results for. <br />
                                        Try another day.
                                    </>
                                }
                            />
                        )}
                    </Stack>
                </Stack>
            }
        />
    );
}
