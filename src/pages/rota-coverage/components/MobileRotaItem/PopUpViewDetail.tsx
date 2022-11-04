import PopUpBase from '@components/PopUpBase';
import { formatHour } from '@components/rota-table/Shift';
import StyledSelect from '@components/select-search/StyledSelect';
import { appConfig } from '@config';
import { rotaCoverageController } from '@controllers';
import { IPopUp } from '@hooks/usePopUp';
import { ClusterCoverage, ClusterWithRelations, Location } from '@LocationOps/model';
import {
    Avatar,
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
import { WardenWithRelations } from '@WardenOps/model';
import { uniq } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import axiosInstant from 'src/helpers/axiosHelper';
import DefaultOption from '../DefaultOption';
import { DistanceResponse, getDistance, LatLng } from '../GMapInterface';
import ReactGMap from '../ReactGMap';
import SelectDate from './SelectDate';
import SelectOption from './SelectOption';

type Props = IPopUp & { shifts?: ShiftRota[]; cluster: ClusterWithRelations; date: Date };

type D = { from: number; to: number; location: Location; distance: number };

export default function PopUpViewDetail(props: Props) {
    const [state, setState] = useState<State>({
        selectDate: props.date,
    });

    const [clusterCoverage, setClusterCoverage] = useState<ClusterCoverage>({ Wardens: [], Locations: [] });

    const [selectSchedule, setSelectSchedule] = useState<D[]>([]);

    useEffect(() => {
        rotaCoverageController
            .getClusterCoverage({ ClusterId: props.cluster.Id!, TimeFrom: state.selectDate })
            .then((res) => {
                setClusterCoverage(res);
            });
    }, [state.selectDate, props.cluster.Id]);

    useEffect(() => {
        const init = async () => {
            if (!state.selectWarden?.Rotas) return;
            const schedules = state.selectWarden.Rotas.map(async (row) => {
                const location = clusterCoverage.Locations.find((v) => v.Location.Id === row.LocationId);

                const distance = await getDistance(
                    {
                        lat: state.selectWarden?.Latitude || 0,
                        lng: state.selectWarden?.Longitude || 0,
                    },
                    {
                        lat: location?.Location.Latitude || 0,
                        lng: location?.Location.Longitude || 0,
                    }
                );

                return {
                    from: moment(row.TimeFrom).get('hour'),
                    to: moment(row.TimeTo).get('hour'),
                    distance: distance,
                    location: location?.Location || ({} as any),
                } as D;
            });

            const _s = await Promise.all(schedules);
            console.log(`_s`, _s);

            setSelectSchedule(_s);
        };

        init();
    }, [clusterCoverage, state.selectWarden]);

    useEffect(() => {
        setState((p) => ({ ...p, selectDate: props.date, selectWarden: undefined }));
    }, [props.date]);

    return (
        <PopUpBase
            {...props}
            fixOverflow
            dialogProps={{
                scroll: 'paper',
                fullWidth: true,
                maxWidth: 'lg',
                // PaperProps: {
                //     sx: { maxWidth: '700px', overflowY: Boolean(state.length <= 2) ? 'hidden' : 'auto' },
                // },
            }}
            onConfirm={() => {
                props.onConfirm?.();
            }}
            // title="View location"
            // subTitle={`Cluster: Admiral Hyson Industrial Estate`}
            hideConfirm
            dialogActionsProps={{ sx: { justifyContent: 'flex-end' } }}
            desc={
                <Stack>
                    <Stack direction={'row'} spacing={2} justifyContent="space-between">
                        <Stack>
                            <Typography variant="h4">View location</Typography>

                            <Typography color={'primary'} variant="body2">
                                Cluster: Admiral Hyson Industrial Estate
                            </Typography>
                        </Stack>

                        <Stack direction={'row'} spacing={2}>
                            <StyledSelect
                                label="Warden"
                                disabledSearch
                                data={clusterCoverage.Wardens}
                                value={state.selectWarden}
                                hasMore={false}
                                next={() => {}}
                                onChange={(option) => {
                                    setState((p) => ({ ...p, selectWarden: option }));
                                }}
                                renderValue={(value) => {
                                    return (
                                        <Typography noWrap>
                                            {state.selectWarden?.FullName || `All wardens (${4})`}
                                        </Typography>
                                    );
                                }}
                                renderDefaultOption={() => <DefaultOption title="All wardens" />}
                                renderOption={(option) => <SelectOption option={option} />}
                            />

                            <SelectDate
                                date={state.selectDate}
                                onChange={(date) => {
                                    setState((p) => ({ ...p, selectDate: date }));
                                }}
                            />
                        </Stack>
                    </Stack>

                    <Stack mt={3} direction={'row'} spacing={3}>
                        <Stack flex={1}>
                            <ReactGMap
                                selectWarden={state.selectWarden}
                                wardens={clusterCoverage.Wardens}
                                locations={clusterCoverage.Locations}
                                onSelectWarden={(w) => setState((p) => ({ ...p, selectWarden: w }))}
                            />
                        </Stack>
                        <Stack flexBasis={'400px'} flexShrink={0} flexGrow={0}>
                            {!state.selectWarden ? (
                                <Stack spacing={1.5}>
                                    <Typography variant={'h6'}>All wardens in cluster</Typography>

                                    <TableContainer>
                                        <Table aria-label="simple table" sx={{ '& th, td': { p: 1.5 } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: 'secondary.main', pl: '0 !important' }}>
                                                        Name
                                                    </TableCell>
                                                    <TableCell align="center">No. of locations</TableCell>
                                                    <TableCell align="right" sx={{ pr: '0 !important' }}></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {clusterCoverage.Wardens.map((row) => {
                                                    const locationIds = uniq(
                                                        row.Rotas?.map((r) => {
                                                            return r.LocationId;
                                                        })
                                                    );

                                                    return (
                                                        <TableRow key={row.Id}>
                                                            <TableCell
                                                                sx={{ color: 'secondary.main', pl: '0 !important' }}
                                                            >
                                                                {row.FullName}
                                                            </TableCell>
                                                            <TableCell align="center">{locationIds.length}</TableCell>
                                                            <TableCell align="right" sx={{ pr: '0 !important' }}>
                                                                {locationIds.length ? (
                                                                    <Typography
                                                                        color="primary.main"
                                                                        variant="caption"
                                                                        sx={{ cursor: 'pointer' }}
                                                                        onClick={() =>
                                                                            setState((p) => ({
                                                                                ...p,
                                                                                selectWarden: row,
                                                                            }))
                                                                        }
                                                                    >
                                                                        View detail
                                                                    </Typography>
                                                                ) : null}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Stack>
                            ) : (
                                <Stack spacing={2}>
                                    <Stack direction={'row'} alignItems="center" spacing={1.5}>
                                        <Avatar
                                            src={state.selectWarden.Picture}
                                            sx={{ border: '3px solid', borderColor: '#007BFF' }}
                                        />
                                        <Typography variant="h6">{state.selectWarden.FullName}</Typography>
                                        {/* </Avatar> */}
                                    </Stack>

                                    <Typography variant="h6" color="#85858A">
                                        Allocated locations on {moment(state.selectDate).format('DD/MM/YYYY')}
                                    </Typography>

                                    <TableContainer>
                                        <Table aria-label="simple table" sx={{ '& th, td': { p: 1.5 } }}>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: 'secondary.main', pl: '0 !important' }}>
                                                        Period
                                                    </TableCell>
                                                    <TableCell>Location</TableCell>
                                                    <TableCell align="center">Distance</TableCell>
                                                    <TableCell align="right" sx={{ pr: '0 !important' }}>
                                                        Cost
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {selectSchedule.map((row, index) => {
                                                    return (
                                                        <TableRow
                                                            key={index}
                                                            sx={{
                                                                '& > td': {
                                                                    border: 'none',
                                                                },
                                                            }}
                                                        >
                                                            <TableCell
                                                                sx={{ color: 'secondary.main', pl: '0 !important' }}
                                                            >
                                                                {formatHour(row.from)} - {formatHour(row.to)}
                                                            </TableCell>
                                                            <TableCell>{row?.location.Name}</TableCell>
                                                            <TableCell align="center">{row.distance}km</TableCell>
                                                            <TableCell align="right" sx={{ pr: '0 !important' }}>
                                                                £{row.distance}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                                <TableRow
                                                    sx={{
                                                        '& > td': {
                                                            // paddingTop: 0,
                                                            // paddingBottom: 0,
                                                            borderBottom: 'none',
                                                            borderTop: '1px solid #eee',
                                                            fontWeight: 500,
                                                        },
                                                    }}
                                                >
                                                    <TableCell
                                                        sx={{ color: 'secondary.main', pl: '0 !important' }}
                                                    ></TableCell>
                                                    <TableCell>Total</TableCell>
                                                    <TableCell align="center">
                                                        {selectSchedule.reduce((prev, cur) => prev + cur.distance, 0)}km
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ pr: '0 !important' }}>
                                                        £{selectSchedule.reduce((prev, cur) => prev + cur.distance, 0)}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Stack>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            }
        />
    );
}

type State = {
    selectDate: Date;
    selectWarden?: WardenWithRelations;
};
