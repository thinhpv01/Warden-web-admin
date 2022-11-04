import { Location } from '@LocationOps/model';
import { Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Warden } from '@WardenOps/model';
import moment from 'moment';
import React from 'react';
import { fakeArray, _weekdays } from 'src/helpers';
import { v4 } from 'uuid';
import { ShiftTypeDisplay } from './Shift';

export enum ShiftStatus {
    full = 'full',
    notFull = 'notFull',
    lieuLeave = 'lieu_leave',
}

export type Shift<T extends Warden = any> = {
    fakeId?: string;
    id?: string;
    start: number;
    end: number;
    status?: ShiftStatus;
    assignedWardens?: T[];
    requiredWarden?: number;
    weekday?: number;
    breakHours?: number;
    date?: Date;
};

export const defaultPeriod: Record<string, any[]> = {
    '1': [],
    '2': [],
    '3': [],
    '4': [],
    '5': [],
    '6': [],
    '0': [],
};

type Props<T> = {
    data: {
        [weekday: string]: T[];
    };
    startDate?: Date;
    displayType?: ShiftTypeDisplay;
    renderOption(option: T, index: number, arr: T[]): JSX.Element;
    renderAction?(shifts: T[], weekday: number, date?: Date): JSX.Element;
    isDisplayDate?: boolean;
    hideLieuLeave?: boolean;
};

export default function RotaTable<T extends Shift>(props: Props<T>) {
    const { data, displayType, renderOption, renderAction, isDisplayDate = true } = props;

    const convertData = (shifts: T[], weekday: number) => {
        let arr: T[] = [];
        let date = !props.startDate ? undefined : moment(props.startDate).isoWeekday(weekday).startOf('day').toDate();
        if (date && weekday === 0) {
            date = moment(date).add(1, 'week').toDate();
        }
        for (let i = 0; i < 24; i++) {
            const none = !shifts.some((s) => i >= s.start && i < s.end);
            if (none) {
                arr.push({
                    fakeId: v4(),
                    start: i,
                    end: i + 1,
                    weekday,
                    date,
                } as T);
            }
        }

        for (let j = 0; j < shifts.length; j++) {
            const index = arr.findIndex((a) => a.end === shifts[j].start);
            arr.splice(index + 1, 0, { ...shifts[j], date });
        }
        return arr.sort((a, b) => a.start - b.start);
    };
    const dateColumn = 'repeat(3, minmax(35px, 0.9fr))';
    const hoursColumn = 'repeat(24, 1fr) 20px';
    const actionColumn = renderAction ? '80px' : '';
    const gridTemplateColumns = `${dateColumn} ${hoursColumn} ${actionColumn}`;

    return (
        <div>
            <Box>
                <Box
                    display={'grid'}
                    gridTemplateColumns={gridTemplateColumns}
                    sx={{ backgroundColor: '#FAFAFA', borderRadius: '5px', p: '8px 16px', pr: 0 }}
                >
                    <Box gridColumn={`span 3`}>
                        <Typography color="primary">Hour</Typography>
                    </Box>
                    {[
                        fakeArray(25).map((_, index) => {
                            return (
                                <Stack key={_.id} justifyContent={'center'} gridColumn={'span 1'}>
                                    <Typography color="primary" variant="subtitle2" ml="-4px">
                                        {index}
                                    </Typography>
                                </Stack>
                            );
                        }),
                    ]}
                </Box>

                {_weekdays
                    .map((i) => data[i])
                    .map((shifts, index) => {
                        return (
                            <Box
                                key={v4()}
                                display={'grid'}
                                gridTemplateColumns={gridTemplateColumns}
                                pl={2}
                                sx={{ py: 1, borderBottom: '1px solid #ddd' }}
                                alignItems="center"
                            >
                                <Box
                                    gridColumn={`span 3`}
                                    display="flex"
                                    flexDirection="column"
                                    alignItems="flex-start"
                                >
                                    <Typography>
                                        <Typography
                                            component={'span'}
                                            variant="body2"
                                            color={[5, 6].includes(index) ? 'red' : 'initial'}
                                        >
                                            {moment(props.startDate)
                                                .weekday(index + 1)
                                                .format('ddd')}{' '}
                                        </Typography>
                                        {props.startDate && isDisplayDate && (
                                            <Typography component={'span'} variant="body2" color="gray">
                                                {moment(props.startDate)
                                                    .weekday(index + 1)
                                                    .format('(DD/MM)')}
                                            </Typography>
                                        )}
                                    </Typography>
                                    {shifts.map((s, i) => {
                                        return (
                                            <>
                                                {s.status === 'lieu_leave' && (
                                                    <Box
                                                        sx={{
                                                            width: 80,
                                                            px: 0.5,
                                                            py: 0.2,
                                                            background: '#FD5F6A',
                                                            textAlign: 'center',
                                                            borderRadius: '3px',
                                                            color: 'white',
                                                            fontSize: 12,
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Lieu/Leave
                                                    </Box>
                                                )}
                                            </>
                                        );
                                    })}
                                </Box>
                                {convertData(shifts, _weekdays[index]).map((s, index, arr) => {
                                    return (
                                        <React.Fragment key={index + 'option'}>
                                            {renderOption(s, index, arr)}
                                        </React.Fragment>
                                    );
                                })}
                                {renderAction?.(
                                    shifts,
                                    _weekdays[index],
                                    !props.startDate
                                        ? undefined
                                        : moment(props.startDate).weekday(_weekdays[index]).startOf('day').toDate()
                                )}
                            </Box>
                        );
                    })}

                <Stack mt={2} direction={'row'} spacing={2} justifyContent="flex-end">
                    {[
                        { color: '#E8F5E9', label: 'Full coverage' },
                        { color: '#FFDC83', label: 'Not full coverage' },
                        { color: '#FD5F6A', label: 'Lieu/Leave', hidden: props.hideLieuLeave },
                        { color: '#DDDDDD', label: 'Outside of working hours' },
                    ]
                        .filter((c) => !c.hidden)
                        .map((t) => {
                            return (
                                <Stack key={t.color} direction={'row'} alignItems="center">
                                    <Box
                                        sx={{
                                            width: '80px',
                                            height: '16px',
                                            bgcolor: t.color,
                                            mr: 1,
                                            borderRadius: '2px',
                                        }}
                                    ></Box>
                                    <Typography variant="body2">{t.label}</Typography>
                                </Stack>
                            );
                        })}
                </Stack>
            </Box>
        </div>
    );
}
