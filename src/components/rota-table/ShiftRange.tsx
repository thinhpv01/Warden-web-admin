import { fakeArray } from '@helpers';
import { Stack, FormControl, Select, MenuItem, Typography, styled } from '@mui/material';
import { difference, isUndefined } from 'lodash';
import React from 'react';
import { formatHour } from './Shift';

export type Value = {
    start?: number;
    end?: number;
};

type Props = {
    value?: Value;
    onChange?(value: Value): void;
    minWidth?: number;
    fullWidth?: boolean;
    hideStartTime?: number[];
    hideEndTime?: number[];
    disabled?: boolean;
};

const StyledSelect = styled(Select)({
    '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input': {
        paddingTop: '10px',
        paddingBottom: '10px',
    },
    '& .MuiSelect-select.MuiInputBase-input.MuiOutlinedInput-input.Mui-disabled': {
        opacity: 1,
        WebkitTextFillColor: 'rgba(0, 0, 0, .65)',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
    },
});

export default function ShiftRange(props: Props) {
    const start = difference(
        fakeArray(25).map((_, index) => index),
        props.hideStartTime ?? []
    );
    const end = difference(
        fakeArray(25).map((_, index) => index),
        props.hideEndTime ?? fakeArray((props.value?.start ?? 0) + 1).map((_, index) => index)
    );

    // console.log('start', start, end);
    return (
        <Stack direction={'row'} spacing={1} pt={'1px'}>
            <FormControl
                fullWidth={props.fullWidth}
                size="small"
                sx={{ minWidth: props.minWidth ? props.minWidth : 130 }}
                disabled={props.disabled}
            >
                <StyledSelect
                    value={props.value?.start ?? ''}
                    onChange={(e) => {
                        const start = e.target.value as number;
                        props.onChange?.({
                            ...props.value,
                            start,
                            end:
                                props.value?.end === undefined || start > props.value.end ? undefined : props.value.end,
                        });
                    }}
                    MenuProps={{ sx: { maxHeight: 200 } }}
                >
                    {start.map((t) => {
                        return (
                            <MenuItem key={t + 'start'} value={t}>
                                {formatHour(t)}
                            </MenuItem>
                        );
                    })}
                </StyledSelect>
            </FormControl>

            <Typography sx={{ lineHeight: '37.13px' }}>-</Typography>

            <FormControl
                fullWidth={props.fullWidth}
                size="small"
                sx={{ minWidth: props.minWidth ? props.minWidth : 130 }}
                disabled={isUndefined(props.value?.start) || props.disabled}
            >
                <StyledSelect
                    value={props.value?.end ?? ''}
                    onChange={(e) => props.onChange?.({ ...props.value, end: e.target.value as number })}
                    MenuProps={{ sx: { maxHeight: 200 } }}
                >
                    {end.map((t) => {
                        // if (
                        //     props.value &&
                        //     props.value.start !== undefined &&
                        //     props.value.end !== undefined &&
                        //     (index <= props.value.start || index > props.value.end)
                        // )
                        //     return null;
                        return (
                            <MenuItem key={t + 'end'} value={t}>
                                {formatHour(t)}
                            </MenuItem>
                        );
                    })}
                </StyledSelect>
            </FormControl>
        </Stack>
    );
}
