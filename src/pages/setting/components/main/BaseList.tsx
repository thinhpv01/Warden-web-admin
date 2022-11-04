import IcNext from '@components/icon/IcNext';
import IcPrev from '@components/icon/IcPrev';
import { Box, Fade, Grid, Grow, Pagination, PaginationItem, Skeleton } from '@mui/material';
import React from 'react';
type Props<T> = {
    list: T[];
    loading?: boolean;
    renderItem?(item: T): React.ReactElement;
    renderEmpty?(): JSX.Element;
    count?: number;
    page?: number;
    onChangePage?(value: any): void;
};
export default function BaseList<T>({ list, loading, renderItem, ...props }: Props<T>) {
    const hasData = list.length > 0;
    return (
        <div>
            {!loading && !hasData && (
                <Fade in={!loading && !hasData}>
                    <div>{props.renderEmpty?.() || <></>}</div>
                </Fade>
            )}

            <Grid xs={12} item container gap={2} justifyContent="center">
                {(!loading ? list : [...list, ...new Array(8)]).map((item: any, index: any) => {
                    return (
                        <Grow in={true} key={index} timeout={Math.min(500 * index, 1000)}>
                            <Grid item xs={12} sm={12} md={12} xl={12}>
                                {item ? (
                                    <Grow in={!!item} timeout={500}>
                                        <Box height={'100%'}>{renderItem ? renderItem?.(item) : <></>}</Box>
                                    </Grow>
                                ) : (
                                    <Box>
                                        <Box sx={{ position: 'relative', paddingTop: '13%' }}>
                                            <Box sx={{ position: 'absolute', inset: 0 }}>
                                                <Skeleton
                                                    sx={{ borderRadius: '10px' }}
                                                    variant="rectangular"
                                                    height={'100%'}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                )}
                            </Grid>
                        </Grow>
                    );
                })}
                {hasData && (
                    <Pagination
                        count={props.count}
                        page={props.page}
                        onChange={(e: any, value: any) => {
                            props.onChangePage?.(value);
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
                        renderItem={(item) => (
                            <PaginationItem components={{ previous: IcPrev, next: IcNext }} {...item} />
                        )}
                    />
                )}
            </Grid>
        </div>
    );
}
