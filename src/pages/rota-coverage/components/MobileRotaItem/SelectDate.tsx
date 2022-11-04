import { ArrowLeftRounded, ArrowRightRounded } from '@mui/icons-material';
import { IconButton, Stack, styled, TextField } from '@mui/material';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import moment from 'moment';
import React, { useEffect } from 'react';

type Props = {
    date: Date;
    onChange(date: Date): void;
};

const STextField = styled(TextField)({
    '& .MuiInputBase-input.MuiOutlinedInput-input': {
        padding: '10px 14px',
    },
    maxWidth: 170,
});

export default function SelectDate({ onChange, date }: Props) {
    const [value, setValue] = React.useState<Date | null>(date);

    const handleChange = (newValue: any | null) => {
        console.log('change', newValue);
        setValue(newValue);
        if (newValue && newValue._isValid) {
            onChange(newValue._d);
        }
    };

    useEffect(() => {
        setValue(date);
    }, [date]);

    return (
        <Stack direction={'row'} spacing={1} justifyContent="flex-end">
            <IconButton
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '5px',
                    backgroundColor: '#EEEEEE',
                }}
                onClick={() => onChange(moment(date).subtract(1, 'day').toDate())}
            >
                <ArrowLeftRounded />
            </IconButton>

            <DesktopDatePicker
                label="Date"
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
                                    setValue(date);
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
                onClick={() => onChange(moment(date).add(1, 'day').toDate())}
            >
                <ArrowRightRounded />
            </IconButton>
        </Stack>
    );
}
