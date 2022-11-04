import { ArrowLeftRounded, ArrowRightRounded } from '@mui/icons-material';
import { Stack, IconButton, styled, TextField, Typography } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useEffect, useState } from 'react';

type Props = {
    startDate: Date;
    onChange(startDate: Date): void;
    hideEndDate?: boolean;
};

const STextField = styled(TextField)({
    '& .MuiInputBase-input.MuiOutlinedInput-input': {
        padding: '10px 14px',
    },
    maxWidth: 200,
});

export function validateDatePickerValue(date: Date) {
    if (![1].includes(moment(date).isoWeekday())) {
        return 'Not first week';
    }

    return null;
}

export default function FilterDate({ onChange, startDate, hideEndDate }: Props) {
    const [value, setValue] = React.useState<Date | null>(startDate);

    const handleChange = (newValue: any | null) => {
        console.log('change', newValue);
        setValue(newValue);
        if (
            newValue &&
            newValue._isValid &&
            validateDatePickerValue(newValue) == null &&
            !moment(newValue).isSame(startDate)
        ) {
            onChange(newValue._d);
        }
    };

    useEffect(() => {
        setValue(startDate);
    }, [startDate]);

    return (
        <Stack direction={'row'} spacing={1} justifyContent="flex-end">
            <IconButton
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '5px',
                    backgroundColor: '#EEEEEE',
                }}
                onClick={() => onChange(moment(startDate).subtract(1, 'weeks').toDate())}
            >
                <ArrowLeftRounded />
            </IconButton>

            <DesktopDatePicker
                label="Start date"
                inputFormat="DD/MM/YYYY"
                value={value}
                onChange={handleChange}
                renderInput={(params) => {
                    return (
                        <STextField
                            size="small"
                            {...params}
                            onBlur={() => {
                                if (!value || !moment(value).isValid() || validateDatePickerValue(value) !== null) {
                                    setValue(startDate);
                                }
                            }}
                        />
                    );
                }}
                onError={(reason, value) => {
                    console.log('reason, value', reason, value);
                }}
                shouldDisableDate={(day) => validateDatePickerValue(day) !== null}
            />

            {!hideEndDate && (
                <>
                    <Typography sx={{ lineHeight: '40px', fontWeight: 600 }}>-</Typography>

                    <DesktopDatePicker
                        label="End date"
                        inputFormat="DD/MM/YYYY"
                        value={moment(value).add(6, 'days').toDate()}
                        onChange={handleChange}
                        renderInput={(params) => <STextField {...params} error={false} size="small" />}
                        disabled
                    />
                </>
            )}
            <IconButton
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '5px',
                    backgroundColor: '#EEEEEE',
                }}
                onClick={() => onChange(moment(startDate).add(1, 'weeks').toDate())}
            >
                <ArrowRightRounded />
            </IconButton>
        </Stack>
    );
}
