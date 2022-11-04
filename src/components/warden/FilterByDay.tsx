import { ArrowLeftRounded, ArrowRightRounded } from '@mui/icons-material';
import { IconButton, Stack, styled, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useEffect } from 'react';

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

export default function FilterByDay({ onChange, startDate, hideEndDate }: Props) {
    const [value, setValue] = React.useState<Date | null>(startDate);

    const handleChange = (newValue: any | null) => {
        console.log('change', newValue);
        setValue(newValue);
        if (newValue && newValue._isValid && !moment(newValue).isSame(startDate)) {
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
                onClick={() => onChange(moment(startDate).subtract(1, 'day').toDate())}
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
                                if (!value || !moment(value).isValid()) {
                                    setValue(startDate);
                                }
                            }}
                        />
                    );
                }}
                onError={(reason, value) => {
                    console.log('reason, value', reason, value);
                }}
            />

            <IconButton
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '5px',
                    backgroundColor: '#EEEEEE',
                }}
                onClick={() => onChange(moment(startDate).add(1, 'day').toDate())}
            >
                <ArrowRightRounded />
            </IconButton>
        </Stack>
    );
}
