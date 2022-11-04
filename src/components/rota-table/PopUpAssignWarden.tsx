import Checkbox from '@components/Checkbox';
import { CStack, HStack, VStack } from '@components/FlexedStack';
import IcUser from '@components/icon/IcUser';
import { getDisabledHours } from '@components/location/PopUpAddPeriod';
import StyledSelect from '@components/select-search/StyledSelect';
import { rotaController, rotaCoverageController } from '@controllers';
import { getWeekday, _weekdays } from '@helpers';
import { Location, RotaCoverage } from '@LocationOps/model';
import { ArrowDropDownRounded } from '@mui/icons-material';
import {
    Avatar,
    Button,
    Collapse,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import { getDistance, getLatLng } from '@pages/rota-coverage/components/GMapInterface';
import { ShiftRota } from '@pages/rota-coverage/hooks/useRota';
import { Rota, WardenWithRelations } from '@WardenOps/model';
import { cloneDeep, difference, orderBy, sortBy } from 'lodash';
import moment from 'moment';
import { useId, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { IPopUp } from 'src/hooks/usePopUp';
import { useBoolean, useDebounce } from 'usehooks-ts';
import { v4 } from 'uuid';
import PopUpBase from '../PopUpBase';
import { formatHour } from './Shift';
import ShiftRange from './ShiftRange';

type WardenWithDistance = WardenWithRelations & { distance?: number };

type Props = Omit<IPopUp, 'onConfirm'> & {
    location: Location;
    shift: ShiftRota;
    startDate: Date;
    availableDays: number[];
    onConfirmed(newRota: RotaCoverage[]): void;
    isMobile?: boolean;
};

const usePopUpAssign = () => {
    const assignPeriodId = useId();
    const collapse = useBoolean(true);
    return {
        assignPeriodId,
        collapse,
    };
};

type C = ReturnType<typeof usePopUpAssign>;

const Option = (props: {
    weekday: number;
    option: WardenWithDistance;
    isValue?: boolean;
    location: Location;
    hideDistance?: boolean;
}) => {
    const { option, isValue, weekday, location } = props;
    const selectWeekday = (option.WardenFreeTimes ?? []).find((w) => w.Weekday === weekday);
    if (!selectWeekday) return null;

    const available = {
        start: new Date(selectWeekday.FreeFrom).getHours(),
        end: new Date(selectWeekday.FreeTo).getHours(),
    };

    const isOutOfWorking = selectWeekday.FreeFrom == null && selectWeekday.FreeTo == null;

    const isOverTime = (option.ActualWeekWorkHour ?? 0) > (option.ContractHours ?? 0);

    return (
        <Stack
            direction={'row'}
            alignItems={'center'}
            sx={{ py: isValue ? 0 : 1, borderBottom: isValue ? 'none' : '1px solid #eee' }}
            spacing={1}
        >
            <Avatar src={option.Picture} sx={{ width: '32px', height: '32px' }}>
                H
            </Avatar>
            <Stack flex={1}>
                <Stack direction={'row'} spacing={1}>
                    <Typography flex={1}>{option.FullName}</Typography>
                    {!props.hideDistance && (
                        <Typography variant="caption">
                            {!isNaN(option.distance || NaN) ? `${option.distance}km` : NaN}
                        </Typography>
                    )}
                </Stack>
                <Stack direction={'row'} alignItems={'center'} justifyContent="space-between" spacing={1}>
                    <Stack direction={'row'} alignItems="center" spacing={1}>
                        <Stack
                            sx={{
                                width: '5px',
                                height: '5px',
                                bgcolor: isOutOfWorking ? 'gray' : 'primary.main',
                                borderRadius: '50%',
                                flexShrink: 0,
                            }}
                        ></Stack>
                        {isOutOfWorking ? (
                            <Typography variant="caption" color="gray">
                                Out of working
                            </Typography>
                        ) : (
                            <Typography variant="caption" color="gray">
                                Available: {`${formatHour(available.start)} - ${formatHour(available.end)}`}
                            </Typography>
                        )}
                    </Stack>

                    <Typography variant="caption" color={isOverTime ? 'error.main' : 'primary.main'}>
                        {option.ActualWeekWorkHour ?? 0}/{option.ContractHours}h
                    </Typography>
                </Stack>
            </Stack>
        </Stack>
    );
};

export type AssignPeriod = 'onlyThisWeek' | 'permanent';

const assignPeriodLabel: Record<AssignPeriod, string> = {
    onlyThisWeek: 'Only this week',
    permanent: 'Permanent (For new warden)',
};

type Form = {
    period: AssignPeriod;
    selectWarden?: WardenWithRelations;
    lunch: number;
    start: number;
    end: number;
    selectDays: number[];
    date?: Date;
};

const getInitSelectDays = (days: number[], shift: ShiftRota) => {
    return days.includes(shift.weekday) ? [shift.weekday] : [];
};

export default function PopUpAssignWarden(props: Props) {
    const [wardens, setWardens] = useState<WardenWithDistance[]>([]);
    const [filterWardens, setFilterWardens] = useState<WardenWithDistance[]>([]);

    const [availableDaysLocation, setAvailableDaysLocation] = useState<number[]>(props.availableDays);
    const [searchValue, setSearchValue] = useState('');

    const initSelectDays = getInitSelectDays(availableDaysLocation, props.shift);
    const currentDate = props.shift.date;

    const [form, setForm] = useState<Form>({
        period: 'onlyThisWeek',
        lunch: 0,
        start: props.shift.start,
        end: props.shift.end,
        selectDays: initSelectDays,
    });

    const { assignPeriodId, collapse } = usePopUpAssign();

    const disabledStart = getDisabledHours(props.shift.start, form.end - 1);
    const disabledEnd = getDisabledHours(form.start + 1, props.shift.end);

    const handleSelectDay = (weekday: number, checked: boolean) => {
        setForm((p) => {
            const newState = { ...p };
            let selectDays = newState.selectDays;

            if (weekday === -1) {
                selectDays = checked ? _weekdays : [];
            } else {
                selectDays = checked ? [...selectDays, weekday] : selectDays.filter((d) => d !== weekday);
            }

            const ifDiff = difference(_weekdays, selectDays).length === 0;
            selectDays = ifDiff ? [-1].concat(selectDays) : selectDays.filter((d) => d !== -1);

            newState.selectDays = selectDays;
            return newState;
        });
    };

    const handleChangeWarden = (warden: any) => {
        setForm((p) => ({ ...p, selectWarden: warden, selectDays: initSelectDays }));
        setSearchValue('');
    };

    useEffect(() => {
        const init = async () => {
            if (!props.location.CountrySubRegionId || !form.date) return;
            const _wardens = (
                await rotaCoverageController.getWardensFreeTimeBySubRegion({
                    SubRegionId: props.location.CountrySubRegionId,
                    TimeFrom: moment(form.date).hour(form.start).toDate(),
                    TimeTo: moment(form.date).hour(form.end).toDate(),
                })
            ).filter((r) => (form.period === 'onlyThisWeek' ? true : !r.HasRotaTemplate));

            if (props.isMobile) {
                const _wardensWithDistance = await Promise.all(
                    _wardens.map(async (w) => {
                        const distance = await getDistance(getLatLng(w), getLatLng(props.location));
                        return {
                            ...w,
                            distance: distance,
                        };
                    })
                );

                const _ordered = orderBy(_wardensWithDistance, (w) => w.distance, 'asc');
                setWardens(_ordered);
            } else {
                setWardens(_wardens);
            }
        };

        init();
    }, [
        form.end,
        form.period,
        form.start,
        props.location.CountrySubRegionId,
        form.date,
        props.location,
        props.isMobile,
    ]);

    useEffect(() => {
        if (!props.open) return;
        setForm({
            period: 'onlyThisWeek',
            lunch: 0,
            start: props.shift.start,
            end: props.shift.end,
            selectDays: getInitSelectDays(props.availableDays, props.shift),
            date: props.shift.date,
        });

        setSearchValue('');

        setAvailableDaysLocation(props.availableDays);
    }, [props.availableDays, props.open, props.shift]);

    const handleSave = async () => {
        console.log('first', form.selectDays);

        try {
            const rota: Rota[] = form.selectDays
                .filter((s) => s !== -1)
                .map((weekday) => {
                    const r = {
                        BreakHours: form.lunch,
                        TimeFrom: moment(currentDate).weekday(weekday).startOf('day').hour(form.start).toDate(),
                        TimeTo: moment(currentDate).weekday(weekday).startOf('day').hour(form.end).toDate(),
                    } as Rota;
                    // Handle select day on Sunday
                    // if (weekday === 0) {
                    //     r.TimeFrom = moment(r.TimeFrom).add(1, 'week').toDate();
                    //     r.TimeTo = moment(r.TimeTo).add(1, 'week').toDate();
                    // }
                    return r;
                });
            console.log(`rotaConverted`, rota);

            const rotaCoverages = await rotaController.bulkCreateByLocation({
                List: rota,
                LocationId: props.location.Id!,
                CreateRotaTemplate: form.period === 'permanent',
                WardenId: form.selectWarden!.Id!,
            });
            props.onConfirmed(rotaCoverages);
            toast.success('Assign successfully!');
        } catch (error) {}
    };

    const disabled = !form.selectWarden || !form.selectDays.length;

    const isDisabledDay = (day: number) => {
        return (
            !availableDaysLocation.includes(day) ||
            (form.selectWarden && !(form.selectWarden.WardenFreeTimes || []).map((w) => w.Weekday).includes(day))
        );
    };

    const disabledAll = _weekdays.some(isDisabledDay);

    useEffect(() => {
        setFilterWardens(
            wardens.filter((w) => w.FullName?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()))
        );
    }, [searchValue, wardens]);

    return (
        <PopUpBase
            open={props.open}
            onClose={props.onClose}
            fixOverflow
            dialogProps={{
                scroll: 'paper',
                fullWidth: true,
                PaperProps: { sx: { maxWidth: '700px', overflowY: 'unset' } },
            }}
            hideConfirm
            hideClose
            title="Assign warden"
            subTitle={`Location: ${props.location.Name}`}
            desc={
                <Stack>
                    <HStack>
                        <FormControl sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <FormLabel
                                id={assignPeriodId}
                                sx={{ marginRight: 3, fontWeight: 500, color: 'unset !important' }}
                            >
                                Assign period:
                            </FormLabel>
                            <RadioGroup
                                value={form.period}
                                onChange={(_, value) => setForm((p) => ({ ...p, period: value as AssignPeriod }))}
                                row
                                aria-labelledby={assignPeriodId}
                                name="row-radio-buttons-group"
                            >
                                {Object.entries(assignPeriodLabel).map(([key, label]) => {
                                    return (
                                        <FormControlLabel
                                            key={key}
                                            value={key}
                                            control={<Radio />}
                                            label={label}
                                            sx={{ userSelect: 'none' }}
                                        />
                                    );
                                })}
                            </RadioGroup>
                        </FormControl>
                    </HStack>

                    <CStack justifyContent={'space-between'}>
                        <Stack>
                            <ShiftRange
                                hideStartTime={disabledStart}
                                hideEndTime={disabledEnd}
                                value={{ start: form.start, end: form.end }}
                                onChange={(v) => setForm((p) => ({ ...p, ...v }))}
                            />
                        </Stack>

                        <Stack>
                            <StyledSelect
                                sx={{ width: 300 }}
                                // listProps={{ style: { width: '300px', left: 'unset', right: 0 } }}
                                value={form.selectWarden}
                                data={filterWardens}
                                hasMore={false}
                                next={() => {}}
                                onChange={handleChangeWarden}
                                renderOption={(option) => (
                                    <Option
                                        option={option}
                                        hideDistance={!props.isMobile}
                                        weekday={props.shift.weekday}
                                        location={props.location}
                                    />
                                )}
                                onChangeSearch={(text) => {
                                    setSearchValue(text);
                                }}
                                searchValue={searchValue}
                                renderValue={(value) =>
                                    form.selectWarden ? (
                                        <Option
                                            isValue
                                            option={form.selectWarden}
                                            weekday={props.shift.weekday}
                                            location={props.location}
                                            hideDistance={!props.isMobile}
                                        />
                                    ) : (
                                        <CStack justifyContent={'flex-start'} spacing={1}>
                                            <Avatar sx={{ width: '32px', height: '32px' }}>
                                                <IcUser />
                                            </Avatar>
                                            <Typography sx={{ userSelect: 'none' }}>Select warden</Typography>
                                        </CStack>
                                    )
                                }
                            />
                        </Stack>
                    </CStack>

                    <Stack mt={2} direction={'row'} alignItems="center" spacing={3}>
                        <Typography>Lunch/Break:</Typography>

                        <FormControl fullWidth size="small">
                            <Select
                                sx={{
                                    '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
                                        py: '10px',
                                    },
                                }}
                                value={form.lunch}
                                onChange={(e) => setForm((p) => ({ ...p, lunch: e.target.value as number }))}
                                MenuProps={{ sx: { maxHeight: 200 } }}
                            >
                                {[0, 1, 2].map((t, index) => {
                                    return (
                                        <MenuItem key={index} value={t}>
                                            {formatHour(t)}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Stack mt={2} sx={{ border: '1px solid #eee', borderRadius: '5px', p: '8px 16px' }}>
                        <CStack justifyContent={'flex-start'} sx={{ cursor: 'pointer' }} onClick={collapse.toggle}>
                            <Typography color="gray">
                                Assign this working hours to this warden for the others days
                            </Typography>
                            <ArrowDropDownRounded
                                color="disabled"
                                sx={{ transform: `rotate(${collapse.value ? 0 : 180}deg)`, transition: '0.3s' }}
                            />
                        </CStack>

                        <Collapse in={collapse.value}>
                            <CStack py={2} pb={1}>
                                <FormControl component="fieldset">
                                    <FormGroup aria-label="position" row>
                                        <FormControlLabel
                                            key={v4()}
                                            value={-1}
                                            disabled={disabledAll}
                                            checked={form.selectDays.includes(-1)}
                                            onChange={(_, checked) => handleSelectDay(-1, checked)}
                                            control={<Checkbox />}
                                            label="All days"
                                            labelPlacement="bottom"
                                            sx={{ userSelect: 'none' }}
                                        />
                                        {getWeekday(props.startDate).map((w) => {
                                            const day = w.weekday;

                                            return (
                                                <FormControlLabel
                                                    key={w.weekday}
                                                    value={day}
                                                    control={<Checkbox />}
                                                    checked={form.selectDays.includes(day)}
                                                    onChange={(_, checked) => handleSelectDay(day, checked)}
                                                    disabled={
                                                        !availableDaysLocation.includes(day) ||
                                                        (form.selectWarden &&
                                                            !(form.selectWarden.WardenFreeTimes || [])
                                                                .map((w) => w.Weekday)
                                                                .includes(day))
                                                    }
                                                    sx={{ userSelect: 'none' }}
                                                    label={
                                                        <Typography textAlign={'center'}>
                                                            {moment(w.date).format('ddd')}
                                                            <br />
                                                            <Typography color="gray" component={'span'}>
                                                                {moment(w.date).format('DD/MM')}
                                                            </Typography>
                                                        </Typography>
                                                    }
                                                    labelPlacement="bottom"
                                                />
                                            );
                                        })}
                                    </FormGroup>
                                </FormControl>
                            </CStack>
                        </Collapse>
                    </Stack>

                    {form.period === 'permanent' && (
                        <Stack mt={2} sx={{ p: 1, borderRadius: '5px', bgcolor: '#EEEEEE' }}>
                            <Typography textAlign={'center'}>
                                Since {moment(props.startDate).format('DD/MM/YYYY')}, this location and these time
                                periods will have been assigned to <br />
                                the{' '}
                                <Typography color="primary.main" component={'span'}>
                                    {form.selectWarden?.FullName || 'selected warden'}
                                </Typography>{' '}
                                as a weekly schedule!
                            </Typography>
                        </Stack>
                    )}

                    <Stack mt={3} direction="row" justifyContent={'space-between'}>
                        <Button variant="cancel" sx={{ minWidth: 170 }} onClick={props.onClose}>
                            Close
                        </Button>
                        <Button variant="contained" sx={{ minWidth: 170 }} onClick={handleSave} disabled={disabled}>
                            Submit
                        </Button>
                    </Stack>
                </Stack>
            }
        />
    );
}
