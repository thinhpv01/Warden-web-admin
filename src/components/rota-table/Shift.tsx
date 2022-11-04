import styled from '@emotion/styled';
import { Stack, SxProps, Typography, TypographyProps } from '@mui/material';
import { Box } from '@mui/system';
import { ReactNode } from 'react';
import { Shift, ShiftStatus } from '.';

export type ShiftTypeDisplay = 'assigned' | 'time';

type Props<T extends Shift> = {
    shift: T;
    index: number;
    arrLength: number;
    displayType?: ShiftTypeDisplay;
    renderActions?(shift: T): ReactNode;
    readonly?: boolean;
    readonlyOutside?: boolean;
    renderTitleShift?(shift?: T): ReactNode;
    onAddPeriod?(shift: T): void;
    titleProps?: TypographyProps;
    renderHover?: ReactNode;
    toolTipSx?: SxProps;
};

const BaseShiftStack = styled(Stack)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    transition: '0.1s',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 500,
});

const Full = styled(BaseShiftStack)({
    color: '#009D4F',
    backgroundColor: '#E8F5E9',
    borderLeft: '1px solid #009D4F',
});

const NotFull = styled(BaseShiftStack)({
    color: '#E01B00',
    backgroundColor: '#FFDC83',
    borderLeft: '1px solid #E01B00',
});
const LieuLeave = styled(BaseShiftStack)({
    color: 'white',
    backgroundColor: '#FD5F6A',
    borderLeft: '1px solid white',
});
const Outside = styled(BaseShiftStack)({
    backgroundColor: '#DDDDDD',
    color: '#DDDDDD',
    ':hover': {
        color: 'white',
        backgroundColor: '#ccc',
    },
});

const OutsideReadonly = styled(BaseShiftStack)({
    backgroundColor: '#DDDDDD',
    color: '#DDDDDD',
    cursor: 'initial',
});
const actionClass = 'action-3';

export const formatHour = (h: number) => {
    return h < 10 ? `0${h}:00` : `${h}:00`;
};

export default function StyledShift<T extends Shift>(props: Props<T>) {
    const { shift: s, index, arrLength, displayType, renderActions } = props;
    const StyledStack =
        s.status === ShiftStatus.lieuLeave
            ? LieuLeave
            : s.status === ShiftStatus.full
            ? Full
            : s.status === ShiftStatus.notFull
            ? NotFull
            : props.readonly || props.readonlyOutside
            ? OutsideReadonly
            : Outside;

    return (
        <Box
            gridColumn={`span ${s.end - s.start}`}
            sx={{
                [`:hover .${actionClass}`]: {
                    visibility: 'visible',
                },
                [`:hover .tooltip-shift`]: {
                    visibility: 'visible',
                    opacity: 1,
                },
                // overflow: 'hidden',
            }}
        >
            <StyledStack
                sx={{
                    borderRadius: index === 0 ? '5px 0 0 5px' : index === arrLength - 1 ? '0 5px 5px 0' : 0,
                    flexDirection: 'row',
                    position: 'relative',
                    cursor: props.readonly ? 'initial !important' : undefined,
                }}
                onClick={() => {
                    if (!s.status && !props.readonly) {
                        props.onAddPeriod?.(props.shift);
                    }
                }}
            >
                <Stack
                    className="tooltip-shift"
                    sx={{
                        ...props.toolTipSx,
                        position: 'absolute',
                        top: '-100%',
                        left: '50%',
                        transform: 'translate(-50%, -8px)',
                        visibility: 'hidden',
                        opacity: 0,
                        transition: 'opacity 0.5s',
                    }}
                >
                    {props.renderHover}
                </Stack>

                <Typography
                    color="inherit"
                    fontWeight={'inherit'}
                    lineHeight={1}
                    textAlign="center"
                    style={{
                        wordBreak: 'break-word',
                        fontSize:
                            props.shift.status && props.shift.start + 1 === props.shift.end ? '0.6rem' : 'inherit',
                    }}
                    {...props.titleProps}
                >
                    {!s.status
                        ? props.readonly
                            ? null
                            : '+'
                        : props.renderTitleShift
                        ? props.renderTitleShift(props.shift)
                        : displayType === 'assigned'
                        ? `${s.assignedWardens?.length}(${s.requiredWarden})`
                        : `${formatHour(s.start)} - ${formatHour(s.end)}`}
                </Typography>

                <Stack
                    className={actionClass}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        display: 'flex',
                        flexDirection: 'row',
                        visibility: 'hidden',
                    }}
                >
                    {!props.readonly && renderActions?.(s)}
                </Stack>
            </StyledStack>
        </Box>
    );
}
