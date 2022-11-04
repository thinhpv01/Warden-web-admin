import IcNext from '@components/icon/IcNext';
import IcPrev from '@components/icon/IcPrev';
import { formatHour } from '@components/rota-table/Shift';
import StyledSelect from '@components/select-search/StyledSelect';
import { leaveDayController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging, formatDate } from '@helpers';
import {
    Box,
    Button,
    Fade,
    Grid,
    Pagination,
    PaginationItem,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import DefaultOption from '@pages/rota-coverage/components/DefaultOption';
import SelectOption from '@pages/rota-coverage/components/SelectOption';
import { LeaveDay } from '@WardenOps/model';
import { upperFirst } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyPage from '../../main/EmptyPage';
import { BaseHead } from '../WardenDetails';
export type Filter = {
    status?: any;
};
export default function LieudaySchedule() {
    const params = useParams<{ id: string }>();
    const [leaveDays, setLeaveDays] = useState<Paging<LeaveDay>>(defaultPaging());
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [filter, setFilter] = useState<Filter>({});
    const [loading, setLoading] = useState(true);

    console.log('🚀 ~ file: LieudaySchedule.tsx ~ line 41 ~ LieudaySchedule ~ filter', filter);
    const statuses = [
        { Name: 'Approved', Value: 'approved' },
        { Name: 'Pending', Value: 'pending' },
        { Name: 'Decline', Value: 'decline' },
    ];
    const handleChange = (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
        setPage(1);
    };
    const onPageChange = async (value: any) => {
        setPage(value);
        await leaveDayController
            .list({
                pageSize: 20,
                page: value,
                filter: { WardenId: parseInt(params.id ?? ''), Status: filter.status?.Value },
            })
            .then((res) => {
                setLeaveDays(res);
                setTotalPage(res.totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .finally(() => setLoading(false));
    };
    const handleDecline = async (leaveDay: LeaveDay) => {
        const _leaveDay: LeaveDay = { ...leaveDay, Status: 'decline' };
        await leaveDayController.upsert(_leaveDay).then((res) => {
            setLeaveDays((prev) => ({
                ...prev,
                rows: prev.rows.map((item) => (item.Id === res.Id ? res : item)),
                // .filter((item) => item.Status !== 'decline'),
            }));
        });
    };
    const handleApproved = async (leaveDay: LeaveDay) => {
        const _leaveDay: LeaveDay = { ...leaveDay, Status: 'approved' };
        await leaveDayController.upsert(_leaveDay).then((res) => {
            setLeaveDays((prev) => ({
                ...prev,
                rows: prev.rows.map((item) => (item.Id === res.Id ? res : item)),
                // .filter((item) => item.Status !== 'approved'),
            }));
        });
    };
    useEffect(() => {
        const init = async () => {
            await leaveDayController
                .list({ pageSize: 20, filter: { WardenId: parseInt(params.id ?? ''), Status: filter.status?.Value } })
                .then((res) => {
                    setLeaveDays(res);
                    setTotalPage(res.totalPages);
                    setPage(res.page);
                })
                .finally(() => setLoading(false));
        };
        init();
    }, [params, filter]);

    const hasData = leaveDays.rows.length > 0;
    return (
        <Grid
            container
            xs={12}
            sx={{
                border: '1px solid #DDDDDD',
                borderRadius: '0px 8px 8px 8px;',
                p: '40px 16px',
            }}
            justifyContent="center"
        >
            <Stack direction="row" width="100%" alignItems="flex-end" justifyContent="space-between">
                <Stack
                    sx={{
                        width: 500,
                        background: '#FAFAFA',
                        border: '1px solid #EEEEEE',
                        borderRadius: '10px',
                        p: 2,
                    }}
                    gap={0.5}
                >
                    <Typography variant="h6">Holiday area: England</Typography>
                    <Typography variant="body1">
                        Holidays (incl. Public holidays):{' '}
                        <Typography variant="body1" component="span" color="primary">
                            10 days
                        </Typography>
                    </Typography>
                    <Typography variant="h6" color="error">
                        Booked: 2 days
                        <Typography variant="h6" component="span" color="secondary" pl={20}>
                            Remaining: 32 days
                        </Typography>
                    </Typography>
                </Stack>
                <StyledSelect
                    label="Status"
                    disabledSearch
                    data={statuses}
                    value={filter.status}
                    hasMore={true}
                    next={() => {}}
                    onChange={(option) => {
                        handleChange({ status: option });
                    }}
                    renderValue={(value) => {
                        return <Typography noWrap>{value?.Name || 'All statuses'}</Typography>;
                    }}
                    renderDefaultOption={() => <DefaultOption title="All statuses" />}
                    renderOption={(option) => <SelectOption option={option} isDisplay={false} />}
                    sx={{
                        width: '30%',
                    }}
                />
            </Stack>
            <TableContainer component={Box} sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 500 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <BaseHead sx={{ pl: 0 }} align="left" title="Day-off Type" />
                            <BaseHead align="center" title="Working shift" />
                            <BaseHead align="left" title="Comment" />
                            <BaseHead align="center" title="Status" />
                            <BaseHead title="" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaveDays.rows.map((item: any, index: any) => {
                            const startHour = formatHour(moment(item.TimeFrom).hour());
                            const endHour = formatHour(moment(item.TimeTo).hour());
                            const atDate = formatDate(item.TimeTo);
                            return (
                                <TableRow>
                                    <TableCell sx={{ pl: 0 }}>
                                        <Typography variant="body1">
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    p: '4px 16px',
                                                    bgcolor: item.Type === 'lieu' ? '#F09453' : '#FD5F6A',
                                                    textAlign: 'center',
                                                    borderRadius: 1,
                                                    color: '#fff',
                                                }}
                                            >
                                                {upperFirst(item.Type)}
                                            </Box>
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography variant="body1">{`${startHour} - ${endHour}, ${atDate}`}</Typography>
                                    </TableCell>

                                    <TableCell >
                                        <Tooltip title={item.Comment ?? ''} arrow placement="top">
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 1,
                                                    overflow: 'hidden',
                                                    wordBreak: 'break-word',
                                                    width: 200,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {item.Comment ?? ''}
                                            </Typography>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Typography
                                            variant="body1"
                                            color={
                                                item.Status === 'approved'
                                                    ? 'primary'
                                                    : item.Status === 'pending'
                                                    ? 'secondary'
                                                    : 'error'
                                            }
                                        >
                                            {item.Status === 'pending'
                                                ? 'Waiting for approve'
                                                : upperFirst(item.Status)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {item.Status === 'pending' && (
                                            <Stack direction="row" justifyContent="flex-end" gap={1}>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    sx={{ flexBasis: 100 }}
                                                    onClick={() => {
                                                        handleDecline(item);
                                                    }}
                                                >
                                                    Decline
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ flexBasis: 100 }}
                                                    onClick={() => handleApproved(item)}
                                                >
                                                    Approve
                                                </Button>
                                            </Stack>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            {!loading && !hasData && (
                <Fade in={!loading && !hasData}>
                    <div>
                        <EmptyPage title="There is no new request!" subTitle={` `} />
                    </div>
                </Fade>
            )}
            {hasData && Boolean(totalPage > 1) && (
                <Pagination
                    count={totalPage}
                    page={page}
                    onChange={(e: any, value: any) => {
                        onPageChange(value);
                    }}
                    shape="rounded"
                    sx={{
                        mt: 2,
                        '& .Mui-selected': {
                            background: '#3479BB1A !important',
                        },
                        '& .MuiPaginationItem-previousNext': {
                            background: '#EEEEEE',
                        },
                    }}
                    renderItem={(item) => <PaginationItem components={{ previous: IcPrev, next: IcNext }} {...item} />}
                />
            )}
        </Grid>
    );
}
