import { CStack } from '@components/FlexedStack';
import IcCancel from '@components/icon/IcCancel';
import IcRoute from '@components/icon/navbar/IcRoute';
import { ShiftWithStatus } from '@components/location/ShiftItem';
import RotaTable, { defaultPeriod, Shift, ShiftStatus } from '@components/rota-table';
import StyledShift from '@components/rota-table/Shift';
import usePopUp from '@hooks/usePopUp';
import { Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ShiftActionRota from '@pages/setting/components/location/ShiftActionRota';
import { ShiftWithRota } from '@pages/setting/components/warden/components/CalendarAndSchedule';
import { RotaTemplate, RotaTemplateDetail, Warden } from '@WardenOps/model';
import { cloneDeep, groupBy, isNil } from 'lodash';
import { useEffect, useState } from 'react';
import { MdArrowDropUp } from 'react-icons/md';
import PopUpAddShift from './PopUpAddShift';
import PopUpScheduleMap from './PopUpScheduleMap';

type TemplateDetail = RotaTemplateDetail & { fakeId?: string };

export interface RotaTemplateWithFakeId extends RotaTemplate {
    RotaTemplateDetails?: TemplateDetail[];
}

export type ScheduleWithStatus = RotaTemplateWithFakeId & {
    fakeId?: string;
    defaultOpen?: boolean;
    scheduleStatus?: 'deleted' | 'new' | 'change';
};

export default function RotaWeekly(props: {
    schedule: ScheduleWithStatus;
    onChange?(schedule: ScheduleWithStatus): void;
    onDelete?(schedule: ScheduleWithStatus): void;
    onToggle?(schedule: ScheduleWithStatus): void;
    warden?: Warden;
    isEdit: boolean;
}) {
    const open = props.schedule.defaultOpen;
    const popUpAddShift = usePopUp();
    const popupViewSchedule = usePopUp();

    const [weekday, setWeekday] = useState<number>();
    const [selectedShift, setSelectedShift] = useState<Shift>();
    const [rotaTemplate, setRotaTemplate] = useState<ScheduleWithStatus>({} as ScheduleWithStatus);
    const contractedHours = props.warden?.ContractHours ?? 0;

    const convertData = (details: TemplateDetail[]) => {
        const data = groupBy(details, 'Weekday');
        const _d: Record<string, ShiftWithRota[]> = { ...defaultPeriod };
        Object.entries(data).forEach(([key, templates]) => {
            _d[key] = templates.map((s) => ({
                start: s.TimeFrom / 60,
                end: s.TimeTo / 60,
                breakHours: s.BreakHours,
                weekday: s.Weekday,
                id: isNil(s.Id) ? s.Id : s.Id + '',
                status: s.Location && Object.keys(s.Location).length !== 0 ? ShiftStatus.full : ShiftStatus.notFull,
                fakeId: s.fakeId,
                location: s.Location,
            }));
        });
        return _d;
    };

    const convertShift = (shift: ShiftWithRota) => {
        return {
            TimeFrom: shift.start * 60,
            TimeTo: shift.end * 60,
            Weekday: shift.weekday ?? 1,
            BreakHours: shift.breakHours,
            LocationId: shift.location?.Id,
            Location: shift.location,
        } as RotaTemplateDetail;
    };
    const handleChangeShift = (shifts: ShiftWithStatus[]) => {
        const clonePrev = cloneDeep(rotaTemplate);
        let periods = clonePrev.RotaTemplateDetails || [];

        for (let i = 0; i < shifts.length; i++) {
            const value = shifts[i];
            if (!value.shiftStatus) continue;

            switch (value.shiftStatus) {
                case 'deleted':
                    periods = periods?.filter((p) => p.fakeId !== value.fakeId);
                    break;
                case 'change':
                    periods = periods?.map((p) => {
                        return value.fakeId === p.fakeId ? { ...p, ...convertShift(value) } : p;
                    });
                    break;
                default:
                    periods.push({ ...convertShift(value), fakeId: value.fakeId });
                    break;
            }
        }
        clonePrev.RotaTemplateDetails = periods;

        props.onChange?.(clonePrev);
        popUpAddShift.onClose();
    };
    const shifts = convertData(rotaTemplate.RotaTemplateDetails || [])[selectedShift?.weekday || 0].sort(
        (a, b) => a.start - b.start
    );
    const totalHours = rotaTemplate.RotaTemplateDetails?.reduce((total, prev) => {
        if (prev.Location && Object.keys(prev.Location).length !== 0) {
            total += prev.TimeTo / 60 - prev.TimeFrom / 60;
        }
        return total;
    }, 0);
    useEffect(() => {
        setRotaTemplate(props.schedule);
    }, [props.schedule]);

    return (
        <Stack
            direction="row"
            width="100%"
            mt={2}
            justifyContent="space-between"
            alignItems={open ? 'flex-start' : 'center'}
        >
            <Stack
                width="90%"
                sx={{
                    border: '1px solid #DDDDDD',
                    borderRadius: 1,
                    p: 1,
                    cursor: 'pointer',
                }}
                justifyContent="space-between"
            >
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    onClick={() => {
                        props.onToggle?.(props.schedule);
                    }}
                >
                    <Stack direction="row" gap={12}>
                        <Typography>Week {props.schedule.OrderIndex}</Typography>
                        <Stack direction="row" gap={2}>
                            <Typography color={(totalHours ?? 0) >= contractedHours ? 'primary' : 'error'}>
                                Total hours: {totalHours}h ({contractedHours}h)
                            </Typography>
                            {/* <Typography>
                                The lasted week applied will start on {formatDate(props.schedule.TimeStart)}
                            </Typography> */}
                        </Stack>
                    </Stack>
                    <Stack
                        sx={{
                            transform: `rotate(${open ? -180 : 0}deg)`,
                            color: '#85858A',
                            transition: 'all 0.3s',
                        }}
                        justifyContent="center"
                    >
                        <MdArrowDropUp fontSize={20} />
                    </Stack>
                </Stack>

                <Collapse in={!!open}>
                    <RotaTable
                        data={convertData(rotaTemplate.RotaTemplateDetails ?? ([] as any))}
                        startDate={props.schedule.TimeStart}
                        isDisplayDate={false}
                        renderOption={(option, index, arr) => {
                            return (
                                <StyledShift
                                    readonly={!props.isEdit}
                                    key={option.id}
                                    arrLength={arr.length}
                                    index={index}
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
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        popupViewSchedule.setTrue();
                                        setWeekday(weekday);
                                    }}
                                >
                                    <IcRoute style={{ width: 25, height: 25 }} />
                                </IconButton>
                            </CStack>
                        )}
                    />
                </Collapse>
            </Stack>
            <Stack direction="row" alignItems="center" pt={open ? 1 : 0}>
                <Tooltip title={'Delete'} placement="top" arrow>
                    <IconButton
                        onClick={() => {
                            props.onDelete?.(props.schedule);
                        }}
                        disabled={!props.isEdit}
                    >
                        <IcCancel style={{ color: props.isEdit ? '#E01B00' : 'inherit' }} />
                    </IconButton>
                </Tooltip>
            </Stack>
            <PopUpAddShift
                {...popUpAddShift}
                selectShift={selectedShift}
                shifts={shifts}
                onConfirm={(s) => {
                    handleChangeShift(s);
                }}
                warden={props.warden}
            />
            <PopUpScheduleMap
                weekday={weekday}
                allShifts={convertData(rotaTemplate.RotaTemplateDetails ?? ([] as any))}
                warden={props.warden ?? ({} as Warden)}
                {...popupViewSchedule}
            />
        </Stack>
    );
}
