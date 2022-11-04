import { CStack } from '@components/FlexedStack';
import IcNewEdit from '@components/icon/IcNewEdit';
import IcRoute from '@components/icon/navbar/IcRoute';
import { ShiftWithStatus } from '@components/location/ShiftItem';
import RotaTable, { defaultPeriod, ShiftStatus } from '@components/rota-table';
import StyledShift from '@components/rota-table/Shift';
import { validateDatePickerValue } from '@components/warden/FilterDateRotaTemplate';
import PopUpAddShift from '@components/warden/PopUpAddShift';
import WeeklySchedule from '@components/warden/WeeklySchedule';
import { rotaController } from '@controllers';
import usePopUp from '@hooks/usePopUp';
import { Button, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import FilterDate from '@pages/rota-coverage/components/FilterDate';
import { Filter } from '@pages/rota-coverage/hooks/useRota';
import { Rota, RotaStatus } from '@WardenOps/model';
import { cloneDeep, groupBy, isNil } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoCalendarOutline } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import ShiftActionRota from '../../location/ShiftActionRota';
import PopUpViewMap from '../PopUpViewMap';
import { useWarden } from '../WardenDetails';

type RotaWarden = Rota & { fakeId?: string };
export type ShiftWithRota = ShiftWithStatus & { rota?: RotaWarden };
export default function CalendarAndSchedule() {
    const params = useParams<{ id: string }>();
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const popupViewMap = usePopUp();
    const popUpAddShift = usePopUp();

    const [filter, setFilter] = useState<Filter>({
        startDate: moment().startOf('isoWeek').toDate(),
    });
    const { warden } = useWarden();
    const [rotaList, setRotaList] = useState<RotaWarden[]>([]);
    const [selectedShift, setSelectedShift] = useState<ShiftWithRota>();
    const [weekday, setWeekday] = useState<number>();

    const handleChange = async (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
        const rota = await rotaController.list({
            filter: {
                WardenId: params.id as any,
                TimeFrom: { $gte: moment(filter.startDate).startOf('day').toDate() },
                TimeTo: { $lte: moment(filter.startDate).add(6, 'day').endOf('day').toDate() },
            },
        });
        setRotaList(rota.rows.map((item) => ({ ...item, fakeId: v4() })));
    };

    const convertData = (rota: RotaWarden[]) => {
        const rotaConvert = rota.map((item) => ({ ...item, Weekday: moment(item.TimeFrom).weekday() }));
        const shiftGroupByWeekday = groupBy(rotaConvert, 'Weekday');
        const rotaByWeekday: Record<string, ShiftWithRota[]> = { ...defaultPeriod };

        Object.entries(shiftGroupByWeekday).forEach(([weekday, shifts]) => {
            rotaByWeekday[weekday] = shifts.map((shift) => {
                const endHour = moment(shift.TimeTo).hour();
                const isEndDay = moment(shift.TimeTo).endOf('day').isSame(shift.TimeTo);
                const status =
                    shift.Status && shift.Status === RotaStatus.LIEU_LEAVE
                        ? ShiftStatus.lieuLeave
                        : shift.Location && Object.keys(shift.Location).length !== 0
                        ? ShiftStatus.full
                        : ShiftStatus.notFull;

                return {
                    start: moment(shift.TimeFrom).hour(),
                    end: isEndDay ? 24 : endHour,
                    id: isNil(shift.Id) ? shift.Id : shift.Id + '',
                    status,
                    fakeId: shift.fakeId,
                    breakHours: shift.BreakHours,
                    rota: shift,
                    date: moment(shift.TimeFrom).toDate(),
                    location: shift.Location,
                    weekday: shift.Weekday,
                };
            });
        });
        return rotaByWeekday;
    };
    const shifts = convertData(rotaList || [])[
        moment(selectedShift?.date).weekday() || (selectedShift?.weekday ?? 0)
    ].sort((a, b) => a.start - b.start);
    const convertRota = (shift: ShiftWithRota) => {
        return {
            TimeFrom: moment(shift.date).hour(shift.start).toDate(),
            TimeTo: moment(shift.date).hour(shift.end).toDate(),
            BreakHours: shift.breakHours,
            LocationId: shift.location?.Id,
            Location: shift.location,
            WardenId: Number(params.id),
        } as Rota;
    };
    const handleChangeShift = (shifts: ShiftWithStatus[]) => {
        setRotaList((prev) => {
            let periods = cloneDeep(prev);
            const _shifts = shifts.filter((s) => s.start !== undefined && s.end !== undefined);
            for (let i = 0; i < _shifts.length; i++) {
                const value = _shifts[i];
                if (!value.shiftStatus) continue;
                switch (value.shiftStatus) {
                    case 'deleted':
                        periods = periods?.filter((p) => p.fakeId !== value.fakeId);
                        break;
                    case 'change':
                        periods = periods?.map((p) => {
                            return value.fakeId === p.fakeId ? { ...p, ...convertRota(value) } : p;
                        });
                        break;
                    default:
                        periods.push({ ...convertRota(value), fakeId: value.fakeId });
                        break;
                }
            }
            return periods;
        });
    };

    const totalHours = rotaList?.reduce((total, prev) => {
        if (prev.Location && Object.keys(prev.Location).length !== 0) {
            total += moment(prev.TimeTo).hour() - moment(prev.TimeFrom).hour() - (prev.BreakHours ?? 0);
        }
        return total;
    }, 0);
    const remainHors = totalHours < (warden.ContractHours ?? 0) && (warden.ContractHours ?? 0) - totalHours;
    const overTimeHours = totalHours > (warden.ContractHours ?? 0) && totalHours - (warden.ContractHours ?? 0);
    const isReadOnly = (option: ShiftWithRota) => {
        const dateOption = moment(option.date).format('YYYY-MM-DD');
        const today = moment(new Date()).format('YYYY-MM-DD');
        const endOfMonth = moment(moment().startOf('isoWeek').toDate())
            .add(4, 'weeks')
            .endOf('isoWeek')
            .format('YYYY-MM-DD');
        const value = moment(dateOption).isBefore(today);
        const valueMonth = moment(dateOption).isAfter(endOfMonth);
        const isLieuLeave = Boolean(option.status === 'lieu_leave');
        return value || valueMonth || isLieuLeave;
    };

    const isDisableUpdate = () => {
        const thisWeek = moment(filter.startDate).format('YYYY-MM-DD');
        const prevWeek = moment(moment().startOf('isoWeek').toDate())
            .subtract(1, 'weeks')
            .endOf('isoWeek')
            .format('YYYY-MM-DD');
        const fourWeekLater = moment(moment().startOf('isoWeek').toDate())
            .add(4, 'weeks')
            .endOf('isoWeek')
            .format('YYYY-MM-DD');
        const nextWeekValue = moment(thisWeek).isAfter(fourWeekLater);
        const prevWeekValue = moment(thisWeek).isBefore(prevWeek);
        return nextWeekValue || prevWeekValue;
    };

    useEffect(() => {
        const init = async () => {
            if (!params.id) return;
            const rota = await rotaController.list({
                filter: {
                    WardenId: params.id as any,
                    TimeFrom: { $gte: moment(filter.startDate).startOf('day').toDate() },
                    TimeTo: { $lte: moment(filter.startDate).add(6, 'day').endOf('day').toDate() },
                },
            });
            setRotaList(
                rota.rows.map((item) => ({
                    ...item,
                    fakeId: v4(),
                }))
            );
        };
        init();
    }, [params.id]);
    return (
        <Grid
            container
            xs={12}
            sx={{
                border: '1px solid #DDDDDD',
                borderRadius: '0px 8px 8px 8px;',
                p: '40px 16px',
            }}
            justifyContent="flex-start"
        >
            <Grid item xs={12}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                    <Typography variant="h5" fontWeight={500}>
                        {t('wardenDetailsPage.title.workCalendar')}
                    </Typography>
                    <FilterDate startDate={filter.startDate} onChange={(startDate) => handleChange({ startDate })} />
                </Stack>
                <Stack
                    width="100%"
                    direction="row"
                    gap={2}
                    sx={{ background: '#3479BB1A', p: 2, borderRadius: 1 }}
                    mb={2}
                >
                    <Stack direction="row" alignItems="center" gap={1}>
                        <IcNewEdit />
                        <Typography variant="body1">
                            {t('wardenDetailsPage.text.contractedHours')}: {warden.ContractHours}h
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ color: theme.palette.primary.main }}>
                        <IoCalendarOutline fontSize={16} />
                        <Typography variant="body1" color="primary">
                            {t('wardenDetailsPage.text.assigned')}: {totalHours}h
                        </Typography>
                    </Stack>
                    {/* <Stack direction="row" alignItems="center" gap={1}>
                        <IoDocumentTextOutline fontSize={16} />
                        <Typography variant="body1" color="#FD5F6A">
                            {t('wardenDetailsPage.text.lieuDay')}: 4h
                        </Typography>
                    </Stack> */}
                    <Typography variant="body1">
                        {t('wardenDetailsPage.text.remainHours')}: {remainHors || 0}h
                    </Typography>
                    <Typography variant="body1" color="secondary">
                        {t('wardenDetailsPage.text.overTime')}: {overTimeHours || 0}h
                    </Typography>
                </Stack>
                <RotaTable
                    data={convertData(rotaList)}
                    startDate={filter.startDate}
                    renderOption={(option, index, arr) => {
                        return (
                            <StyledShift
                                key={option.id}
                                arrLength={arr.length}
                                index={index}
                                readonly={isReadOnly(option)}
                                shift={option}
                                toolTipSx={{ width: 270 }}
                                onAddPeriod={(shift) => {
                                    setSelectedShift(shift);
                                    popUpAddShift.setTrue();
                                }}
                                renderHover={
                                    <Stack>
                                        {option.status === ShiftStatus.full && (
                                            <Stack sx={{ background: '#85858A', borderRadius: '10px', p: '5px' }}>
                                                <Typography color="#fff" variant="body2">
                                                    Break: {option.breakHours} hour
                                                </Typography>
                                                <Typography color="#fff" variant="body2">
                                                    Location: {option.location?.Name}
                                                </Typography>
                                            </Stack>
                                        )}
                                        {option.status === ShiftStatus.notFull && (
                                            <Stack
                                                sx={{
                                                    background: '#85858A',
                                                    borderRadius: '10px',
                                                    p: '5px',
                                                    height: 45,
                                                }}
                                                justifyContent="center"
                                            >
                                                <Typography color="#fff" align="center" variant="body2">
                                                    Not assigned to site
                                                </Typography>
                                            </Stack>
                                        )}
                                    </Stack>
                                }
                                renderActions={(shift) => {
                                    return (
                                        <ShiftActionRota
                                            key={shift.id}
                                            shift={shift}
                                            onEdit={(shift) => {
                                                setSelectedShift(shift);
                                                popUpAddShift.setTrue();
                                            }}
                                        />
                                    );
                                }}
                            />
                        );
                    }}
                    renderAction={(shifts, weekday) => (
                        <CStack sx={{ width: 80 }}>
                            <Tooltip title={'Routes'} placement="top" arrow>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        popupViewMap.setTrue();
                                        setWeekday(weekday);
                                    }}
                                >
                                    <IcRoute style={{ width: 25, height: 25 }} />
                                </IconButton>
                            </Tooltip>
                        </CStack>
                    )}
                />
            </Grid>
            <Stack width="100%" direction="row" gap={2} justifyContent="flex-end" mt={3}>
                <Button variant="outlined" onClick={() => navigate('/setting/warden')}>
                    {t('wardenDetailsPage.button.cancel')}
                </Button>
                <Button
                    variant="contained"
                    disabled={isDisableUpdate()}
                    onClick={async () => {
                        await rotaController.bulkUpsert({
                            list: rotaList,
                            TimeFrom: moment(filter.startDate).startOf('day').toDate(),
                            TimeTo: moment(filter.startDate).add(6, 'day').endOf('day').toDate(),
                            WardenId: Number(params.id),
                        });

                        const rota = await rotaController.list({
                            filter: {
                                WardenId: params.id as any,
                                TimeFrom: { $gte: moment(filter.startDate).startOf('day').toDate() },
                                TimeTo: { $lte: moment(filter.startDate).add(6, 'day').endOf('day').toDate() },
                            },
                        });
                        setRotaList(
                            rota.rows.map((item) => ({
                                ...item,
                                fakeId: v4(),
                            }))
                        );
                        toast.success('Update calendar successfully!');
                    }}
                >
                    {t('wardenDetailsPage.button.updateCalendar')}
                </Button>
            </Stack>
            <WeeklySchedule warden={warden} />
            <PopUpAddShift
                {...popUpAddShift}
                selectShift={selectedShift}
                shifts={shifts}
                onConfirm={(s) => {
                    handleChangeShift(s);
                    popUpAddShift.onClose();
                }}
                warden={warden}
            />
            <PopUpViewMap {...popupViewMap} allShifts={convertData(rotaList)} weekday={weekday} warden={warden} />
        </Grid>
    );
}
