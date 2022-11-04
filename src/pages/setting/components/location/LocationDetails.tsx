import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import PopUpAddPeriod from '@components/location/PopUpAddPeriod';
import { ShiftWithStatus } from '@components/location/ShiftItem';
import RotaTable, { defaultPeriod, Shift, ShiftStatus } from '@components/rota-table';
import StyledShift from '@components/rota-table/Shift';
import { locationController } from '@controllers';
import usePopUp from '@hooks/usePopUp';
import { Location, LocationType, OperationalPeriod } from '@LocationOps/model';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Breadcrumbs,
    Button,
    Container,
    FormControl,
    FormControlLabel,
    Link,
    Radio,
    RadioGroup,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { cloneDeep, groupBy, isNil } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import LocationItem from './LocationItem';
import ShiftActions from './ShiftActions';

export const UNIT = 60;

type Period = OperationalPeriod & { fakeId?: string };

interface LocationWithFakeId extends Location {
    OperationalPeriods?: Period[];
}

export default function LocationDetails() {
    const params = useParams<{ id: string }>();
    const theme = useTheme();
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [location, setLocation] = useState<LocationWithFakeId>({} as LocationWithFakeId);
    const popUpAddPeriod = usePopUp();
    const [selectedShift, setSelectedShift] = useState<Shift>();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocation((prev) => ({ ...prev, LocationType: event.target.value as LocationType }));
    };

    const convertData = (periods: Period[]) => {
        const data = groupBy(periods, 'Weekday');
        const _d: Record<string, Shift[]> = { ...defaultPeriod };

        Object.entries(data).forEach(([key, shifts]) => {
            _d[key] = shifts.map((s) => ({
                start: s.TimeFrom / 60,
                end: s.TimeTo / 60,
                requiredWarden: s.RequireWarden,
                assignedWardens: [] as any,
                status: ShiftStatus.notFull,
                weekday: s.Weekday,
                id: isNil(s.Id) ? s.Id : s.Id + '',
                fakeId: s.fakeId,
            }));
        });
        return _d;
    };

    const convertShift = (shift: ShiftWithStatus) => {
        return {
            TimeFrom: shift.start * UNIT,
            TimeTo: shift.end * UNIT,
            RequireWarden: shift.requiredWarden,
            Weekday: shift.weekday ?? 1,
        } as OperationalPeriod;
    };
    const handleChangeShift = (shifts: ShiftWithStatus[]) => {
        setLocation((prev) => {
            const clonePrev = cloneDeep(prev);
            let periods = clonePrev.OperationalPeriods || [];
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
                            return value.fakeId === p.fakeId ? { ...p, ...convertShift(value) } : p;
                        });
                        break;
                    default:
                        periods.push({ ...convertShift(value), LocationId: location.Id || 0, fakeId: value.fakeId });
                        break;
                }
            }
            clonePrev.OperationalPeriods = periods;

            return clonePrev;
        });
    };

    useEffect(() => {
        const init = async () => {
            if (!params.id) return;
            const res = await locationController.get(params.id);
            setLocation({ ...res, OperationalPeriods: res.OperationalPeriods?.map((p) => ({ ...p, fakeId: v4() })) });
        };

        init();
    }, [params]);

    const shifts = convertData(location.OperationalPeriods || [])[selectedShift?.weekday || 0].sort(
        (a, b) => a.start - b.start
    );
    console.log('🚀 ~ file: LocationDetails.tsx ~ line 123 ~ LocationDetails ~ shifts', shifts);

    const breadcrumbs: IBreadCrumbs[] = [
        { title: 'Manage' },
        { title: 'Location', href: '/setting/location' },
        { title: location.Name ?? '' },
    ];
    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Typography fontSize={24}>{location.Name}</Typography>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <FormControl sx={{ mt: 2 }}>
                <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={location.LocationType || ''}
                    onChange={handleChange}
                >
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Typography fontSize={14}>Location type:</Typography>
                        <FormControlLabel value="static" control={<Radio />} label="Static" />
                        <FormControlLabel value="mobile" control={<Radio />} label="Mobile" />
                    </Stack>
                </RadioGroup>
            </FormControl>
            <Stack mt={2} spacing={2}>
                <Typography>Operational period</Typography>
                <RotaTable
                    data={convertData(location.OperationalPeriods || [])}
                    renderOption={(option, index, arr) => {
                        return (
                            <StyledShift
                                key={index}
                                arrLength={arr.length}
                                index={index}
                                shift={option}
                                renderTitleShift={(shift) => shift?.requiredWarden || 1}
                                onAddPeriod={(shift) => {
                                    setSelectedShift(shift);
                                    popUpAddPeriod.setTrue();
                                }}
                                renderActions={(shift) => (
                                    <ShiftActions
                                        key={shift.id}
                                        shift={shift}
                                        onEdit={(shift) => {
                                            setSelectedShift(shift);
                                            popUpAddPeriod.setTrue();
                                        }}
                                    />
                                )}
                            />
                        );
                    }}
                    renderAction={
                        location.LocationType === 'mobile' ? (shifts) => <LocationItem shifts={shifts} /> : undefined
                    }
                />
                <PopUpAddPeriod
                    {...popUpAddPeriod}
                    selectShift={selectedShift}
                    shifts={shifts}
                    onConfirm={(s) => {
                        handleChangeShift(s);
                        popUpAddPeriod.onClose();
                    }}
                />
            </Stack>
            <Stack
                width="100%"
                direction="row"
                justifyContent="space-between"
                mt={3}
                sx={{
                    '& button': {
                        minWidth: 150,
                    },
                }}
            >
                <Button variant="cancel" onClick={() => navigate('/setting/location')}>
                    {t('wardenDetailsPage.button.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        locationController.upsert(location).then((res) => {
                            setLocation(res);
                            toast.success('Save successfully!');
                        });
                    }}
                >
                    Save
                </Button>
            </Stack>
        </Container>
    );
}
