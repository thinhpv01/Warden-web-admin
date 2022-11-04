import IcCancel from '@components/icon/IcCancel';
import { ShiftWithStatus } from '@components/location/ShiftItem';
import { Shift } from '@components/rota-table';
import { formatHour } from '@components/rota-table/Shift';
import ShiftRange from '@components/rota-table/ShiftRange';
import StyledSelect from '@components/select-search/StyledSelect';
import { rotaCoverageController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging } from '@helpers';
import { Location, LocationType } from '@LocationOps/model';
import {
    Box,
    Collapse,
    FormControl,
    FormControlLabel,
    IconButton,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Typography,
} from '@mui/material';
import DefaultOption from '@pages/rota-coverage/components/DefaultOption';
import SelectOption from '@pages/rota-coverage/components/SelectOption';
import { Warden } from '@WardenOps/model';
import { upperFirst } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { MdArrowDropUp } from 'react-icons/md';
import { useDebounce } from 'usehooks-ts';

export type Value = Pick<Shift, 'start' | 'end' | 'breakHours'>;

type Area = {
    value: LocationType;
    selected?: boolean;
    location?: Location;
};

type ShiftItemProps = {
    shift: ShiftWithStatus;
    onChange(value: ShiftWithStatus): void;
    onDelete?(shift: ShiftWithStatus): void;
    toggleOpen?(shift: ShiftWithStatus): void;
    warden?: Warden;
};

type SelectLocationProps = {
    locations: Paging<Location>;
    location?: Location;
    locationType: LocationType;
    onChange?(option: Location): void;
    onChangeSearch?(text: string): void;
    onGetMore?(): void;
    hasMore: boolean;
    isDisable: boolean;
    searchValue?: string;
};

const SelectLocation = (props: SelectLocationProps) => {
    const { locations, location, locationType, onChange, onChangeSearch, onGetMore, hasMore, isDisable, searchValue } =
        props;

    const listLocationType = locations?.rows.filter((item) => item.LocationType === locationType);
    return (
        <Stack direction="row" alignItems="center" gap={3} width="100%">
            <FormControlLabel
                value={locationType}
                control={<Radio />}
                label={upperFirst(locationType)}
                sx={{ width: 100 }}
            />
            <StyledSelect
                sx={{ width: '100%', maxWidth: 500, pl: locationType === 'static' ? 0.8 : 0 }}
                data={listLocationType}
                value={location}
                hasMore={hasMore}
                next={() => onGetMore?.()}
                onChange={(option) => {
                    onChange?.(option ?? ({} as Location));
                }}
                onChangeSearch={(text) => onChangeSearch?.(text)}
                searchValue={searchValue}
                renderValue={(value) => {
                    return <Typography noWrap>{value?.Name || `Enter/select location name`}</Typography>;
                }}
                disabled={isDisable}
                renderDefaultOption={() => <DefaultOption title="Unassigned" />}
                renderOption={(option) => <SelectOption option={option} />}
            />
        </Stack>
    );
};

export default function BaseShift(props: ShiftItemProps) {
    const [state, setState] = useState<Area[]>([
        {
            value: 'static',
            selected: props.shift.location?.LocationType ? props.shift.location?.LocationType === 'static' : true,
        },
        {
            value: 'mobile',
            selected: props.shift.location?.LocationType === 'mobile',
        },
    ]);
    const [locations, setLocations] = useState<Paging<Location>>(defaultPaging({ pageSize: 10 }));

    const [value, setValue] = useState('');
    const debouncedValue = useDebounce<string>(value ?? '', 300);

    const open = props.shift.defaultOpen;
    const isValid = !isNaN(props.shift.start) && !isNaN(props.shift.end);

    const timeFrom =
        props.shift.start && props.shift.defaultOpen === true
            ? moment(props.shift.date).hour(props.shift.start).toDate()
            : new Date();
    const timeTo =
        props.shift.end && props.shift.defaultOpen === true
            ? moment(props.shift.date).hour(props.shift.end).toDate()
            : new Date();

    const handleChange = (value: Partial<Value>) => {
        props.onChange({ ...props.shift, ...value });
    };
    const onChangeLocation = (location: Location) => {
        setState((prev) => prev.map((item) => ({ ...item, location: item.selected === true ? location : undefined })));
        props.onChange({ ...props.shift, location });
    };
    const onChangeLocationType = (event: any) => {
        setState((prev) => prev.map((item) => ({ ...item, selected: item.value === (event.target.value as any) })));
    };
    const onGetMore = async () => {
        await rotaCoverageController
            .listLocationMissingWarden({
                page: locations.page + 1,
                pageSize: 20,
                TimeFrom: timeFrom,
                TimeTo: timeTo,
                search: { content: debouncedValue, fields: ['Name'] },
                filter: { CountrySubRegionId: props.warden?.CountrySubRegionId },
            })
            .then((res) => {
                const _res = { ...res, rows: [...locations.rows, ...res.rows] };
                setLocations(_res);
            });
    };
    const isHasMore = Boolean(locations.page < locations.totalPages);
    useEffect(() => {
        setState((prev) =>
            prev.map((item) => ({
                ...item,
                location: item.value === props.shift.location?.LocationType ? props.shift.location : undefined,
                selected: !props.shift.location?.LocationType
                    ? item.selected
                    : props.shift.location.LocationType === item.value,
            }))
        );
        rotaCoverageController
            .listLocationMissingWarden({
                page: 1,
                pageSize: 20,
                TimeFrom: timeFrom,
                TimeTo: timeTo,
                search: { content: debouncedValue, fields: ['Name'] },
                filter: { CountrySubRegionId: props.warden?.CountrySubRegionId },
            })
            .then((res) => {
                setLocations(res);
            });
    }, [props.shift, debouncedValue]);
    return (
        <Stack
            direction="row"
            width="100%"
            justifyContent="space-between"
            alignItems={open ? 'flex-start' : 'center'}
            gap={2}
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
                    sx={{
                        background: '#FAFAFA',
                        borderRadius: 1,
                        py: 0.5,
                    }}
                    onClick={() => props.toggleOpen?.(props.shift)}
                >
                    <Stack direction="row" gap={2}>
                        <Typography color={!isValid ? 'error' : 'inherit'} pl={1}>
                            {!isValid
                                ? `Please fill operational period`
                                : `${formatHour(props.shift.start)} - ${formatHour(props.shift.end)} (${
                                      props.shift.end - props.shift.start
                                  }h)`}
                        </Typography>
                        <Typography color={props.shift.location ? 'primary' : 'error'}>
                            {props.shift.location ? 'Assigned' : 'Not assigned'}
                        </Typography>
                    </Stack>
                    <Box
                        sx={{
                            transform: `rotate(${open ? -180 : 0}deg)`,
                            color: '#85858A',
                            transition: 'all 0.3s',
                        }}
                    >
                        <MdArrowDropUp fontSize={24} />
                    </Box>
                </Stack>
                <Collapse in={!!open}>
                    <Typography>
                        Time shift
                        <span style={{ color: '#EF1320', textShadow: '#EF1320' }}> *</span>
                    </Typography>
                    <ShiftRange
                        fullWidth
                        value={{ start: props.shift.start, end: props.shift.end }}
                        onChange={(value) => {
                            handleChange({ ...value });
                            console.log(value);
                        }}
                        hideStartTime={props.shift.disabledStart}
                        hideEndTime={props.shift.disabledEnd}
                    />
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2} gap={3.5}>
                        <Typography variant="body1">Lunch/Break: </Typography>
                        <FormControl fullWidth sx={{ '& .MuiSvgIcon-root': { fontSize: '1.25rem' } }}>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                size="small"
                                MenuProps={{ sx: { maxHeight: 200 } }}
                                value={props.shift.breakHours ?? 0}
                                onChange={(value) => handleChange({ breakHours: value.target.value as any })}
                            >
                                {[0, 1, 2].map((t, index) => {
                                    return (
                                        <MenuItem key={index + 'start'} value={index}>
                                            {formatHour(index)}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </FormControl>
                    </Stack>
                    <Stack mt={2}>
                        <Typography variant="body1">Assign area: </Typography>
                        <FormControl>
                            <RadioGroup
                                aria-labelledby="demo-controlled-radio-buttons-group"
                                name="controlled-radio-buttons-group"
                                value={state.find((item) => item.selected === true)?.value}
                                onChange={onChangeLocationType}
                            >
                                <Stack gap={2}>
                                    {state.map((item, index) => {
                                        return (
                                            <SelectLocation
                                                key={index + 'z'}
                                                locations={locations}
                                                onChange={(option) => {
                                                    const isDefaultValue = Boolean(Object.keys(option).length <= 0);
                                                    if (isDefaultValue) {
                                                        setValue('');
                                                    }
                                                    onChangeLocation(option);
                                                }}
                                                locationType={item.value as any}
                                                location={item.location}
                                                onChangeSearch={(text) => setValue(text)}
                                                hasMore={isHasMore}
                                                onGetMore={onGetMore}
                                                isDisable={Boolean(!item.selected)}
                                                searchValue={value}
                                            />
                                        );
                                    })}
                                </Stack>
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                </Collapse>
            </Stack>
            <Stack direction="row" alignItems="center" pt={open ? 1 : 0}>
                <IconButton onClick={() => props.onDelete?.(props.shift)}>
                    <IcCancel style={{ color: '#E01B00' }} />
                </IconButton>
            </Stack>
        </Stack>
    );
}
