import { CStack } from '@components/FlexedStack';
import { Shift } from '@components/rota-table';
import { formatHour } from '@components/rota-table/Shift';
import ShiftRange from '@components/rota-table/ShiftRange';
import { Location } from '@LocationOps/model';
import { Close } from '@mui/icons-material';
import { Collapse, IconButton, Stack, TextField, Typography } from '@mui/material';
import { MdArrowDropUp } from 'react-icons/md';

export type ShiftWithStatus = Shift & {
    fakeId?: string;
    defaultOpen?: boolean;
    shiftStatus?: 'deleted' | 'new' | 'change';
    disabledStart?: number[];
    disabledEnd?: number[];
    location?: Location;
};
export type Value = Pick<Shift, 'start' | 'end' | 'requiredWarden'>;

type ShiftItemProps = {
    shift: ShiftWithStatus;
    onChange(value: ShiftWithStatus): void;
    onDelete?(shift: ShiftWithStatus): void;
    toggleOpen?(shift: ShiftWithStatus): void;
};

const ShiftItem = (props: ShiftItemProps) => {
    const open = props.shift.defaultOpen;

    const isValid = !isNaN(props.shift.start) && !isNaN(props.shift.end);

    const handleChange = (value: Partial<Value>) => {
        props.onChange({ ...props.shift, ...value });
    };

    return (
        <Stack direction="row" width="100%" justifyContent="space-between" gap={2}>
            <Stack
                width="90%"
                sx={{
                    border: '1px solid #DDDDDD',
                    borderRadius: 1,
                    p: open ? '8px 16px 16px 16px' : '8px 16px',
                    cursor: 'pointer',
                    transition: '0.3s',
                }}
                justifyContent="space-between"
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack
                        onClick={() => props.toggleOpen?.(props.shift)}
                        direction="row"
                        flex={1}
                        alignItems="center"
                        justifyContent={'space-between'}
                        sx={{ bgcolor: '#FAFAFA', p: '2px 4px', pl: 1, borderRadius: '5px' }}
                    >
                        <Stack direction="row" gap={2}>
                            <Typography color={!isValid ? 'error' : 'inherit'}>
                                {!isValid
                                    ? `Please fill operational period`
                                    : `${formatHour(props.shift.start)} - ${formatHour(props.shift.end)} (${
                                          props.shift.end - props.shift.start
                                      }h)`}
                            </Typography>
                        </Stack>
                        <CStack
                            sx={{
                                transform: `rotate(${open ? -180 : 0}deg)`,
                                color: '#85858A',
                                transition: 'all 0.3s',
                            }}
                        >
                            <MdArrowDropUp fontSize={24} />
                        </CStack>
                    </Stack>
                </Stack>

                <Collapse in={!!open}>
                    <Stack mt={1} spacing={'10px'}>
                        <Stack>
                            <Typography>
                                Time
                                <span style={{ color: '#EF1320', textShadow: '#EF1320' }}> *</span>
                            </Typography>

                            <Stack>
                                <ShiftRange
                                    fullWidth
                                    value={{ start: props.shift.start, end: props.shift.end }}
                                    onChange={(value) => handleChange({ ...value })}
                                    hideStartTime={props.shift.disabledStart}
                                    hideEndTime={props.shift.disabledEnd}
                                />
                            </Stack>
                        </Stack>

                        <Stack>
                            <Typography>
                                No. of wardens
                                <span style={{ color: '#EF1320', textShadow: '#EF1320' }}> *</span>
                            </Typography>
                            <TextField
                                size="small"
                                fullWidth
                                value={props.shift.requiredWarden}
                                onChange={(e) => handleChange({ requiredWarden: e.target.value as any })}
                            />
                        </Stack>
                    </Stack>
                </Collapse>
            </Stack>
            <Stack>
                <IconButton size="small" color="error" onClick={() => props.onDelete?.(props.shift)}>
                    <Close />
                </IconButton>
            </Stack>
        </Stack>
    );
};

export default ShiftItem;
