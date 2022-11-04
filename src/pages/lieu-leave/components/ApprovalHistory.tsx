import IcNext from '@components/icon/IcNext';
import IcPrev from '@components/icon/IcPrev';
import IcSearch from '@components/icon/IcSearch';
import { formatHour } from '@components/rota-table/Shift';
import StyledSelect from '@components/select-search/StyledSelect';
import { leaveDayController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging, formatDate } from '@helpers';
import {
    Box,
    Button,
    Fade,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
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
import EmptyPage from '@pages/setting/components/main/EmptyPage';
import { BaseHead } from '@pages/setting/components/warden/WardenDetails';
import { LeaveDay } from '@WardenOps/model';
import { upperFirst } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebounce } from 'usehooks-ts';
import { TypeBox } from './NewRequest';
export type Filter = {
    status?: any;
};
export default function ApprovalHistory() {
    const params = useParams<{ id: string }>();
    const [leaveDays, setLeaveDays] = useState<Paging<LeaveDay>>(defaultPaging());
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [filter, setFilter] = useState<Filter>({});
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const debouncedValue = useDebounce<string>(searchValue ?? '', 300);

    const statuses = [
        { Name: 'Approved', Value: 'approved' },
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
                filter: { Status: filter.status?.Value ? filter.status?.Value : ['approved', 'decline'] },
                WardenName: debouncedValue,
            })
            .then((res) => {
                setLeaveDays(res);
                setTotalPage(res.totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        const init = async () => {
            await leaveDayController
                .list({
                    pageSize: 20,
                    filter: { Status: filter.status?.Value ? filter.status?.Value : ['approved', 'decline'] },
                    WardenName: debouncedValue,
                })
                .then((res) => {
                    setLeaveDays(res);
                    setTotalPage(res.totalPages);
                    setPage(res.page);
                })
                .finally(() => setLoading(false));
        };
        init();
    }, [params, filter, debouncedValue]);

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
            <Stack direction="row" width="100%" alignItems="flex-end" justifyContent="space-between" gap={2}>
                <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    onChange={(e: any) => {
                        setSearchValue(e.target.value);
                    }}
                >
                    <InputLabel htmlFor="outlined-adornment" sx={{ color: '#DDDDDD' }}>
                        Search by warden name
                    </InputLabel>
                    <OutlinedInput
                        id="outlined-adornment"
                        endAdornment={
                            <InputAdornment position="end">
                                <IconButton aria-label="toggle search" edge="end">
                                    <IcSearch />
                                </IconButton>
                            </InputAdornment>
                        }
                        label="Search by warden name"
                        sx={{ py: '1.5px' }}
                    />
                </FormControl>
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
                            <BaseHead sx={{ pl: 0 }} align="center" title="Warden" />
                            <BaseHead align="center" title="Type" />
                            <BaseHead align="center" title="Working shift" />
                            <BaseHead align="left" title="Comment" />
                            <BaseHead align="center" title="Status" />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leaveDays.rows.map((item: any, index: any) => {
                            const startHour = moment(item.TimeFrom).format('HH:mm');
                            const endHour = moment(item.TimeTo).format('HH:mm');
                            const atDate = formatDate(item.TimeTo);
                            return (
                                <TableRow>
                                    <TableCell sx={{ pl: 0, textAlign: 'center' }}>
                                        <Typography variant="body1">{item.Warden?.FullName}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <TypeBox item={item} />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Typography variant="body1">{`${startHour} - ${endHour}, ${atDate}`}</Typography>
                                    </TableCell>

                                    <TableCell>
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
                                                    cursor: 'pointer',
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
