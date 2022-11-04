import { allHours, getArr, getDisabledHours } from '@components/location/PopUpAddPeriod';
import { ShiftWithStatus } from '@components/location/ShiftItem';
import PopUpBase from '@components/PopUpBase';
import { Shift } from '@components/rota-table';
import { formatDate } from '@helpers';
import { Button, Stack, Typography } from '@mui/material';
import { Warden } from '@WardenOps/model';
import { cloneDeep, difference } from 'lodash';
import { useEffect, useState } from 'react';
import { HiPlusSm } from 'react-icons/hi';
import { IPopUp } from 'src/hooks/usePopUp';
import { v4 } from 'uuid';
import BaseShift from './BaseShift';

type Props = Omit<IPopUp, 'onConfirm'> & {
    selectShift?: Shift;
    shifts: ShiftWithStatus[];
    onConfirm?(shifts: ShiftWithStatus[]): void;
    warden?: Warden;
};

const EmptyShift = () => {
    return (
        <Stack
            direction="row"
            sx={{
                width: 650,
                height: 200,
                background: '#FAFAFA',
                borderRadius: 1,
            }}
            alignItems="center"
            justifyContent="center"
        >
            <Typography color="#C5C5C5" variant="h3" fontWeight={500}>
                Have no shift on this day!
            </Typography>
        </Stack>
    );
};
export default function PopUpAddShift(props: Props) {
    const [state, setState] = useState<ShiftWithStatus[]>([]);
    const stateWithDisabled = (shifts: ShiftWithStatus[]) => {
        const _shifts = cloneDeep(shifts.filter((s) => s.shiftStatus !== 'deleted'));
        let sorted = _shifts.sort((a, b) => a.start - b.start);
        let availableHours = allHours.slice(0, allHours.length - 1);
        sorted.forEach((value, index) => {
            availableHours = difference(availableHours, getArr(value.start, value.end));
        });

        sorted = sorted.map((value, index, arr) => {
            let disabledStart: number[] = [];
            let disabledEnd: number[] = [];

            if (arr.length > 1) {
                if (isNaN(value.start) || isNaN(value.end)) {
                    disabledStart = difference(allHours, availableHours);
                    disabledEnd = getDisabledHours(value.start + 1, arr[index + 1]?.start || 24);
                } else {
                    disabledStart = getDisabledHours(arr[index - 1]?.end ?? 0, (arr[index + 1]?.start ?? 24) - 1);
                    disabledEnd = getDisabledHours(value.start + 1, arr[index + 1]?.start ?? 24);
                }
            }

            return { ...value, disabledStart, disabledEnd };
        });
        return sorted;
    };
    const findIndex = (shifts: ShiftWithStatus[], shift: ShiftWithStatus) =>
        shifts.findIndex((s) => s.fakeId === shift.fakeId);

    const handleDelete = (shift: ShiftWithStatus) => {
        setState((prev) => {
            const cloneShifts = prev.slice();
            const index = findIndex(cloneShifts, shift);
            cloneShifts[index].shiftStatus = 'deleted';
            return cloneShifts;
        });
    };

    const handleAdd = () => {
        setState((prev) => [
            ...prev,
            {
                fakeId: v4(),
                requiredWarden: 1,
                defaultOpen: true,
                shiftStatus: 'new',
                date: props.selectShift?.date,
                weekday: props.selectShift?.weekday,
            } as any,
        ]);
    };

    const handleChange = (value: ShiftWithStatus) => {
        setState((prev) => {
            const cloneShifts = prev.slice();
            const index = findIndex(cloneShifts, value);
            const shift = cloneShifts[index];
            cloneShifts[index] = { ...shift, ...value, shiftStatus: value.shiftStatus || 'change' };
            return cloneShifts;
        });
    };
    const toggleOpen = (shift: Shift) => {
        setState((prev) => {
            const newArr = prev.slice();
            newArr.forEach((item, index) => {
                if (item.id === shift.id) {
                    item.defaultOpen = !item.defaultOpen;
                } else {
                    item.defaultOpen = false;
                }
            });
            return newArr;
        });
    };

    useEffect(() => {
        const init = () => {
            if (!props.open) {
                setState((prev) => prev.map((p) => ({ ...p, defaultOpen: false, breakHours: 0 })));
                return;
            }
            const propsShift = props.selectShift;
            let shifts: ShiftWithStatus[] = props.shifts.map((s) => ({
                ...s,
                defaultOpen: propsShift?.fakeId === s.fakeId ? true : undefined,
            }));

            if (propsShift && !propsShift.id && !propsShift.status) {
                const newShift: ShiftWithStatus = {
                    ...propsShift,
                    shiftStatus: 'new',
                    defaultOpen: true,
                };
                if (!shifts[0]) {
                    shifts.push(newShift);
                } else if (propsShift.start < shifts[0].start) {
                    shifts.unshift(newShift);
                } else if (propsShift.start > shifts.at(-1)!.start) {
                    shifts.push(newShift);
                } else {
                    for (let i = 0; i < shifts.length - 1; i++) {
                        if (propsShift.start > shifts[i].start && propsShift.start <= shifts[i + 1].start) {
                            shifts.splice(i + 1, 0, newShift);
                            break;
                        }
                    }
                }
            }
            setState(shifts);
        };
        init();
    }, [props.open, props.selectShift, props.shifts]);
    const shiftsList = state
        .map((s) => {
            const f = stateWithDisabled(state).find((sd) => sd.fakeId === s.fakeId);
            return { ...s, ...f };
        })
        .filter((s) => s.shiftStatus !== 'deleted');
    return (
        <PopUpBase
            open={props.open}
            dialogProps={{
                fullWidth: true,
                PaperProps: {
                    sx: { maxWidth: '700px' },
                },
            }}
            onClose={props.onClose}
            onConfirm={() => {
                props.onConfirm?.(state);
            }}
            title={'Edit calendar'}
            subTitle={`Date: ${formatDate(props.selectShift?.date ?? new Date())}`}
            subTitleProps={{ sx: { color: 'gray' } }}
            minWidthButton={150}
            fixOverflow
            desc={
                <Stack>
                    {Boolean(shiftsList.length > 0) ? (
                        <Stack spacing={2}>
                            {shiftsList.map((s, index) => {
                                return (
                                    <BaseShift
                                        key={s.fakeId}
                                        shift={s}
                                        onChange={handleChange}
                                        onDelete={handleDelete}
                                        toggleOpen={toggleOpen}
                                        warden={props.warden}
                                    />
                                );
                            })}
                        </Stack>
                    ) : (
                        <EmptyShift />
                    )}
                    <Button sx={{ mt: 1, width: 'fit-content' }} startIcon={<HiPlusSm />} onClick={handleAdd}>
                        Add shift
                    </Button>
                </Stack>
            }
        />
    );
}
