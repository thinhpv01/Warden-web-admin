import PopUpBase from '@components/PopUpBase';
import { Shift } from '@components/rota-table';
import { fakeArray } from '@helpers';
import { Button, Stack } from '@mui/material';
import { cloneDeep, difference } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { HiPlusSm } from 'react-icons/hi';
import { IPopUp } from 'src/hooks/usePopUp';
import { v4 } from 'uuid';
import ShiftItem, { ShiftWithStatus } from './ShiftItem';

type Props = Omit<IPopUp, 'onConfirm'> & {
    selectShift?: Shift;
    shifts: Shift[];
    onConfirm?(shifts: ShiftWithStatus[]): void;
};
export const allHours = fakeArray(25).map((_, index) => index);

export const getArr = (start: number, end: number) => {
    const arr = [];
    if (!isNaN(start) && !isNaN(end)) {
        for (let index = start; index < end; index++) {
            arr.push(index);
        }
    }
    return arr;
};

export const getDisabledHours = (start: number, end: number) => {
    const validHours = [];
    for (let i = start; i <= end; i++) {
        validHours.push(i);
    }
    return difference(allHours, validHours);
};

export default function PopUpAddPeriod(props: Props) {
    const [state, setState] = useState<ShiftWithStatus[]>([]);

    const stateWithDisabled = (shifts: ShiftWithStatus[]) => {
        const _shifts = cloneDeep(shifts.filter((s) => s.shiftStatus !== 'deleted'));
        let sorted = _shifts.sort((a, b) => a.start - b.start);
        console.log(`sorted`, sorted);

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

                // else if (index === 0) {
                //     disabledStart = getDisabledHours(arr[index - 1]?.end ?? 0, arr[index + 1].start - 1);
                //     disabledEnd = getDisabledHours(value.start + 1, arr[index + 1].start);
                // } else if (index === arr.length - 1) {
                //     disabledStart = getDisabledHours(arr[index - 1].end, value.start);
                //     disabledEnd = getDisabledHours(value.start + 1, 24);
                // } else {
                //     disabledStart = getDisabledHours(arr[index - 1].end, value.start);
                //     disabledEnd = getDisabledHours(value.start + 1, arr[index + 1].start);
                // }
            }

            return { ...value, disabledStart, disabledEnd };
        });
        return sorted;
    };

    console.log(`state`, state, stateWithDisabled(state));

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
            { fakeId: v4(), requiredWarden: 1, defaultOpen: true, shiftStatus: 'new' } as any,
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

    useEffect(() => {
        const init = () => {
            if (!props.open) {
                setState((prev) => prev.map((p) => ({ ...p, defaultOpen: false })));
                return;
            }
            const propsShift = props.selectShift;
            console.log(`propsShift`, propsShift);
            console.log(`props.shifts`, props.shifts);
            let shifts: ShiftWithStatus[] = props.shifts.map((s) => ({
                ...s,
                defaultOpen: propsShift?.fakeId === s.fakeId ? true : undefined,
            }));

            if (propsShift && !propsShift.id && !propsShift.status) {
                const newShift: ShiftWithStatus = {
                    ...propsShift,
                    requiredWarden: 1,
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

    const toggleOpen = (shift: Shift) => {
        setState((prev) => {
            const newArr = prev.slice();
            const index = findIndex(prev, shift);
            newArr[index].defaultOpen = !newArr[index].defaultOpen;
            return newArr;
        });
    };

    return (
        <PopUpBase
            open={props.open}
            dialogProps={{ fullWidth: true, maxWidth: 'sm' }}
            onClose={props.onClose}
            onConfirm={() => {
                console.log('onConfirm', state);
                props.onConfirm?.(state);
            }}
            title={'Edit operational period'}
            subTitle={`Day: ${moment()
                .weekday(props.selectShift?.weekday || 0)
                .format('dddd')}`}
            subTitleProps={{ sx: { color: 'gray' } }}
            minWidthButton={150}
            desc={
                <Stack>
                    <Stack spacing={2}>
                        {state
                            .map((s) => {
                                const f = stateWithDisabled(state).find((sd) => sd.fakeId === s.fakeId);
                                return { ...s, ...f };
                            })
                            .filter((s) => s.shiftStatus !== 'deleted')
                            .map((s, index) => {
                                return (
                                    <ShiftItem
                                        key={s.fakeId}
                                        shift={s}
                                        onChange={handleChange}
                                        onDelete={handleDelete}
                                        toggleOpen={toggleOpen}
                                    />
                                );
                            })}
                    </Stack>

                    <Stack>
                        <Button
                            sx={{ mt: 1, width: 'fit-content' }}
                            size="small"
                            startIcon={<HiPlusSm />}
                            onClick={handleAdd}
                        >
                            Add period
                        </Button>
                    </Stack>
                </Stack>
            }
        />
    );
}
