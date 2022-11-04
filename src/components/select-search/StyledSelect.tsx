import { BaseModel } from '@Core';
import styled from '@emotion/styled';
import { ArrowDropDownRounded } from '@mui/icons-material';
import {
    Box,
    BoxProps,
    ClickAwayListener,
    Fade,
    IconButton,
    Stack,
    SxProps,
    TextField,
    Typography,
} from '@mui/material';
import { theme } from '@theme';
import { isEqual } from 'lodash';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';
import InfiniteScroll, { Props } from 'react-infinite-scroll-component';
import { v4 } from 'uuid';

const SBox = styled(Box)({
    border: '1px solid rgba(0, 0, 0, 0.23)',
    height: '40px',
    borderRadius: '3px',
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    minWidth: 200,
});

const BoxOption = styled(Box)({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    border: '1px solid #eee',
    borderRadius: 'inherit',
    right: 0,
    width: '100%',
    backgroundColor: 'white',
    zIndex: 1199,
    // maxHeight: 300,
    // overflowY: 'auto',
});

const Option = styled(Stack)({
    transition: '0.25s',
    ':hover': {
        backgroundColor: '#eee',
    },
    padding: '0px 12px',
    marginTop: '-1px',
    // borderBottom: "1px solid #eee",
});

const SIconButton = styled(IconButton)({
    position: 'absolute',
    right: 4,
    top: '50%',
    transform: 'translateY(-50%)',
    padding: 0,
});

type OwnProps<T> = {
    renderDefaultOption?(): ReactNode;
    renderOption(option: T): JSX.Element;
    onChange(option?: T): any;
    data: T[];
    value?: T;
    renderValue(selectedValue?: T): JSX.Element;
    searchValue?: string;
    onChangeSearch?(text: string): void;
    disabledSearch?: boolean;
    sx?: SxProps;
    label?: string;
    listProps?: BoxProps;
    isEqual?(option: T, value?: T): boolean;
    disabled?: boolean;
    optionHeight?: number;
} & Pick<Props, 'next' | 'hasMore'>;

export default function StyledSelect<T extends BaseModel>(props: OwnProps<T>) {
    const [open, setOpen] = useState(false);

    const preventMouseEvent = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const id = useId();

    const allOptionHeight = 46;
    const searchHeight = 51;

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box width={'200px'} sx={props.sx}>
                <SBox
                    onClick={() => !props.disabled && setOpen(!open)}
                    sx={
                        props.disabled
                            ? {
                                  cursor: 'initial !important',
                                  userSelect: 'none',
                                  filter: 'contrast(0.1)',
                                  backgroundColor: '#ffffff54',
                                  border: 'none !important',
                              }
                            : {}
                    }
                >
                    {props.label && (
                        <Typography
                            component={'label'}
                            sx={{
                                top: 0,
                                position: 'absolute',
                                transform: 'translate(-13px, -12px) scale(0.75)',
                                backgroundColor: 'white',
                                px: '6px',
                            }}
                        >
                            {props.label}
                        </Typography>
                    )}
                    <Stack sx={{ maxWidth: 'calc(100% - 35px)', overflow: 'hidden' }}>
                        {props.renderValue(props.value)}
                    </Stack>
                    <SIconButton size="small">
                        <ArrowDropDownRounded
                            fontSize="small"
                            sx={{
                                transform: open ? 'rotate(0deg)' : 'rotate(-180deg)',
                                transition: '0.3s',
                            }}
                        />
                    </SIconButton>

                    <Fade in={open}>
                        <BoxOption {...props.listProps} id={id}>
                            <InfiniteScroll
                                dataLength={props.data.length}
                                next={props.next}
                                hasMore={props.hasMore}
                                loader={
                                    <Option sx={{ bgcolor: 'unset !important', py: '8px !important' }}>
                                        <Typography>Loading...</Typography>
                                    </Option>
                                }
                                scrollableTarget={id}
                                // style={{ maxHeight: '300px' }}
                                height={
                                    98 -
                                    (props.disabledSearch ? searchHeight : 0) -
                                    (!props.renderDefaultOption ? allOptionHeight : 0) +
                                    Math.min(4, props.data.length) * (props.optionHeight || 55)
                                }
                            >
                                {/* Default option */}
                                {props.renderDefaultOption && (
                                    <Option
                                        position={'sticky'}
                                        top={0}
                                        zIndex={1}
                                        onClick={(e) => {
                                            setOpen(false);
                                            props.onChange?.();
                                        }}
                                        bgcolor={props.value ? 'white' : '#eee'}
                                    >
                                        {props.renderDefaultOption?.()}
                                    </Option>
                                )}

                                {/* Search */}
                                {!props.disabledSearch && (
                                    <Option
                                        sx={{
                                            bgcolor: 'white !important',
                                            p: '6px !important',
                                            position: 'sticky',
                                            top: !props.renderDefaultOption ? 0 : allOptionHeight,
                                            zIndex: 1,
                                        }}
                                        onClick={(e) => {
                                            preventMouseEvent(e);
                                        }}
                                    >
                                        <TextField
                                            placeholder="Search"
                                            size="small"
                                            autoComplete="off"
                                            value={props.searchValue}
                                            onChange={(e) => props.onChangeSearch?.(e.target.value)}
                                        />
                                    </Option>
                                )}

                                {props.data.map((a) => {
                                    return (
                                        <Option
                                            key={v4()}
                                            onClick={(e) => {
                                                preventMouseEvent(e);
                                                setOpen(false);
                                                props.onChange?.(a);
                                            }}
                                            bgcolor={
                                                (
                                                    props.isEqual
                                                        ? props.isEqual(a, props.value)
                                                        : props.value && isEqual(a, props.value)
                                                )
                                                    ? '#eee'
                                                    : undefined
                                            }
                                        >
                                            {props.renderOption(a)}
                                        </Option>
                                    );
                                })}
                            </InfiniteScroll>
                        </BoxOption>
                    </Fade>
                </SBox>
            </Box>
        </ClickAwayListener>
    );
}
