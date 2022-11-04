import PopUpBase from '@components/PopUpBase';
import { formatHour } from '@components/rota-table/Shift';
import { IPopUp } from '@hooks/usePopUp';
import { Location } from '@LocationOps/model';
import {
    Box,
    Button,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import EmptyPage from '@pages/setting/components/main/EmptyPage';
import { ShiftWithRota } from '@pages/setting/components/warden/components/CalendarAndSchedule';
import Map from '@pages/setting/components/warden/Map';
import { BaseHead } from '@pages/setting/components/warden/WardenDetails';
import { Warden } from '@WardenOps/model';
import { sample, upperFirst, values } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';

type Props = IPopUp & {
    weekday?: number;
    allShifts: Record<string, ShiftWithRota[]>;
    warden: Warden;
};
type Day = {
    value: string;
    weekday: number;
};
export default function PopUpScheduleMap(props: Props) {
    const days: Day[] = [
        { value: 'Monday', weekday: 1 },
        { value: 'Tuesday', weekday: 2 },
        { value: 'Wednesday', weekday: 3 },
        { value: 'Thursday', weekday: 4 },
        { value: 'Friday', weekday: 5 },
        { value: 'Saturday', weekday: 6 },
        { value: 'Sunday', weekday: 0 },
    ];
    const [isSelected, setIsSelected] = useState<Day>({ value: '', weekday: -1 });
    const [shifts, setShifts] = useState<ShiftWithRota[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    // const [warden, setWarden] = useState<Warden>({} as Warden);

    const newArr = values(props.allShifts);

    useEffect(() => {
        const listFiltered = newArr.flat().filter((item) => {
            if (item.weekday === isSelected.weekday) {
                return item;
            }
        });
        setShifts(listFiltered);
    }, [isSelected, props.open]);
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
    }, [shifts, isSelected, props.open]);

    useEffect(() => {
        setIsSelected({
            value: moment()
                .day(props.weekday ?? 0)
                .format('dddd'),
            weekday: props.weekday ?? 0,
        });
    }, [props.weekday, props.open]);
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
            title={`View working route on ${isSelected.value}`}
            subTitle={`Warden name: ${props.warden?.FullName}`}
            hideConfirm
            dialogActionsProps={{ sx: { justifyContent: 'flex-end' } }}
            desc={
                <Stack>
                    <Stack mt={3} direction={'row'} spacing={3}>
                        <Stack flex={0.8}>
                            <Map locations={locations} warden={props.warden} />
                        </Stack>
                        <Stack flex={0.2}>
                            <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                                {days.map((item, index) => {
                                    return (
                                        <Button
                                            key={index + 'z'}
                                            variant={isSelected.weekday === item.weekday ? 'contained' : 'outlined'}
                                            onClick={() => {
                                                setIsSelected({
                                                    value: moment().day(item.weekday).format('dddd'),
                                                    weekday: item.weekday,
                                                });
                                            }}
                                            size="small"
                                        >
                                            {item.value}
                                        </Button>
                                    );
                                })}
                            </Stack>

                            {shifts.length > 0 ? (
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
                                                        <TableRow key={index + 's'}>
                                                            <TableCell sx={{ pl: 0 }}>
                                                                <Typography variant="body1" color="secondary">
                                                                    <Typography variant="body1">{`${formatHour(
                                                                        item.start
                                                                    )} - ${formatHour(item.end)} `}</Typography>
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell
                                                                align="left"
                                                                sx={{
                                                                    width: 'auto',
                                                                    display: '-webkit-box',
                                                                    WebkitBoxOrient: 'vertical',
                                                                    WebkitLineClamp: 1,
                                                                    overflow: 'hidden',
                                                                    wordBreak: 'break-word',
                                                                }}
                                                            >
                                                                <Typography variant="body1">
                                                                    {item.location?.Address ?? 'Unassigned'}
                                                                </Typography>
                                                            </TableCell>

                                                            <TableCell align="right">
                                                                <Typography
                                                                    variant="body1"
                                                                    color={
                                                                        item.location?.LocationType === 'static'
                                                                            ? 'primary'
                                                                            : item.location?.LocationType === 'mobile'
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
                            ) : (
                                <EmptyPage />
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            }
        />
    );
}
