import IcNext from '@components/icon/IcNext';
import IcPrev from '@components/icon/IcPrev';
import IcSearch from '@components/icon/IcSearch';
import { formatHour } from '@components/rota-table/Shift';
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
import EmptyPage from '@pages/setting/components/main/EmptyPage';
import { BaseHead } from '@pages/setting/components/warden/WardenDetails';
import { LeaveDay } from '@WardenOps/model';
import { upperFirst } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'usehooks-ts';

export const TypeBox = ({ item }: { item: LeaveDay }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <Typography variant="body1">
                <Box
                    sx={{
                        width: 100,
                        p: '4px 16px',
                        bgcolor: item.Type === 'holiday' ? '#F09453' : item.Type === 'absence' ? '#FD5F6A' : '#3EB6E4',
                        textAlign: 'center',
                        borderRadius: 1,
                        color: '#fff',
                    }}
                >
                    {item.Type === 'absence' ? 'Sickness' : upperFirst(item.Type)}
                </Box>
            </Typography>
        </Box>
    );
};
export default function NewRequest() {
    const [leaveDays, setLeaveDays] = useState<Paging<LeaveDay>>(defaultPaging());
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const debouncedValue = useDebounce<string>(searchValue ?? '', 300);

    const onPageChange = async (value: any) => {
        setPage(value);
        await leaveDayController
            .list({
                pageSize: 20,
                page: value,
                filter: { Status: 'pending' },
                WardenName: debouncedValue,
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
                .list({ pageSize: 20, filter: { Status: 'pending' }, WardenName: debouncedValue })
                .then((res) => {
                    setLeaveDays(res);
                    setTotalPage(res.totalPages);
                    setPage(res.page);
                })
                .finally(() => setLoading(false));
        };
        init();
    }, [debouncedValue]);

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
            <TableContainer component={Box} sx={{ mt: 2 }}>
                <Table sx={{ minWidth: 500 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <BaseHead sx={{ pl: 0 }} align="center" title="Warden" />
                            <BaseHead align="center" title="Type" />
                            <BaseHead align="center" title="Working shift" />
                            <BaseHead align="left" title="Comment" />
                            <BaseHead align="center" title="Status" />
                            <BaseHead title="" />
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
                                    <TableCell align="right">
                                        {item.Status === 'pending' && (
                                            // <Stack direction="row" justifyContent="flex-end" gap={1}>
                                            //     <Button
                                            //         variant="outlined"
                                            //         color="error"
                                            //         size="small"
                                            //         sx={{ flexBasis: 100 }}
                                            //         onClick={() => {
                                            //             handleDecline(item);
                                            //         }}
                                            //     >
                                            //         Decline
                                            //     </Button>
                                            //     <Button
                                            //         variant="contained"
                                            //         size="small"
                                            //         sx={{ flexBasis: 100 }}
                                            //         onClick={() => handleApproved(item)}
                                            //     >
                                            //         Approve
                                            //     </Button>
                                            // </Stack>
                                            <a
                                                href={`${process.env.REACT_APP_PEOPLE_HR_URL}/Pages/LeftSegment/Authorization.aspx`}
                                                target="blank"
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ flexBasis: 80, py: 0.8, fontSize: 13 }}
                                                >
                                                    Change status
                                                </Button>
                                            </a>
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
