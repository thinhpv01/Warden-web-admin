import { Stack, styled, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useEffect } from 'react';

type Props = {
    startDate: Date;
    onChange(startDate: Date): void;
    isEdit: boolean;
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

export default function FilterDateRotaTemplate({ onChange, startDate, isEdit }: Props) {
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
            <DesktopDatePicker
                label="Latest apply"
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
                disabled={isEdit}
                disablePast
            />
        </Stack>
    );
}
