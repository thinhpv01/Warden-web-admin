import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import { regionController, subRegionController, wardenController } from '@controllers';
import { ListProps, Paging } from '@Core';
import { defaultPaging } from '@helpers';
import { CountryRegion, CountrySubRegion } from '@LocationOps/model';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { Warden } from '@WardenOps/model';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import BaseList from '../main/BaseList';
import EmptyPage from '../main/EmptyPage';
import FilterWarden, { Filter } from './FilterWarden';
import WardenCard from './WardenCard';
export default function WardenBase() {
    const theme = useTheme();
    const [wardens, setWardens] = useState<Warden[]>([]);
    const [regions, setRegions] = useState<Paging<CountryRegion>>(defaultPaging({ pageSize: 10 }));
    const [subRegions, setSubRegions] = useState<Paging<CountrySubRegion>>(defaultPaging({ pageSize: 10 }));
    const [filter, setFilter] = useState<Filter>({});
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const [value, setValue] = useState('');
    const debouncedValue = useDebounce<string>(value ?? '', 300);
    const handleChange = (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
        setPage(1);
    };

    const onPageChange = async (value: any) => {
        setPage(value);
        const filterProps: ListProps<Warden> = {
            search: { content: debouncedValue, fields: ['FullName'] },
            filter: {
                CountrySubRegionId: filter.subRegion?.Id,
            },
            pageSize: 10,
            page: value,
        };
        if (!debouncedValue) {
            delete filterProps.search;
        }
        if (filter.subRegion && filter.subRegion.Id) {
            const CountrySubRegionId: number = filter.subRegion.Id;
            filterProps.filter = {
                ...filterProps.filter,
                CountrySubRegionId,
            };
        } else {
            if (filter.region && filter.region.Id) {
                await subRegionController
                    .list({ pageSize: 10, filter: { CountryRegionId: filter.region?.Id } })
                    .then((res) => {
                        setSubRegions(res);

                        const CountrySubRegionId: number[] = res.rows.map((r) => r.Id) as any;
                        filterProps.filter = {
                            ...filterProps.filter,
                            CountrySubRegionId,
                        };
                    });
            } else {
                delete filterProps.filter;
            }
        }

        await wardenController
            .list(filterProps)
            .then((res) => {
                setWardens(res.rows);
                setTotalPage(res.totalPages);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .finally(() => setLoading(false));
    };
    const onGetMoreRegions = async () => {
        await regionController
            .list({
                page: regions.page + 1,
                pageSize: 10,
            })
            .then((res) => {
                const _res = { ...res, rows: [...regions.rows, ...res.rows] };
                setRegions(_res);
            });
    };
    const onGetMoreSubRegions = async () => {
        await subRegionController
            .list({
                page: subRegions.page + 1,
                pageSize: 10,
            })
            .then((res) => {
                const _res = { ...res, rows: [...subRegions.rows, ...res.rows] };
                setSubRegions(_res);
            });
    };
    useEffect(() => {
        const init = async () => {
            await regionController.list({ pageSize: 10 }).then((res) => setRegions(res));
        };
        init();
    }, []);
    useEffect(() => {
        const initFilter = async () => {
            const filterProps: ListProps<Warden> = {
                search: { content: debouncedValue, fields: ['FistName', 'LastName'] },
                filter: {
                    CountrySubRegionId: filter.subRegion?.Id,
                },
                pageSize: 10,
            };
            if (!debouncedValue) {
                delete filterProps.search;
            }
            if (filter.subRegion?.Id) {
                const CountrySubRegionId: number = filter.subRegion.Id;
                filterProps.filter = {
                    ...filterProps.filter,
                    CountrySubRegionId,
                };
            } else {
                if (filter.region && filter.region.Id) {
                    await subRegionController
                        .list({ pageSize: 10, filter: { CountryRegionId: filter.region?.Id } })
                        .then((res) => {
                            setSubRegions(res);

                            const CountrySubRegionId: number[] = res.rows.map((r) => r.Id) as any;
                            filterProps.filter = {
                                ...filterProps.filter,
                                CountrySubRegionId,
                            };
                        });
                } else {
                    delete filterProps.filter;
                    await subRegionController.list({ pageSize: 10 }).then((res) => {
                        setSubRegions(res);
                    });
                }
            }

            await wardenController
                .list(filterProps)
                .then((res) => {
                    setWardens(res.rows);
                    setTotalPage(res.totalPages);
                    setPage(res.page);
                })
                .finally(() => setLoading(false));
        };
        initFilter();
    }, [filter, debouncedValue]);
    const breadcrumbs: IBreadCrumbs[] = [{ title: 'Manage' }, { title: 'Warden' }];
    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Typography fontSize={24}>Warden</Typography>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <FilterWarden
                regions={regions}
                onGetMoreRegions={onGetMoreRegions}
                subRegions={subRegions}
                onGetMoreSubRegions={onGetMoreSubRegions}
                filter={filter}
                handleChange={handleChange}
                onChangeSearch={(key) => setValue(key)}
            />
            <Box mt={2}>
                <BaseList
                    list={wardens}
                    renderItem={(warden) => <WardenCard warden={warden} />}
                    count={totalPage}
                    page={page}
                    loading={loading}
                    onChangePage={(value) => {
                        onPageChange(value);
                    }}
                    renderEmpty={() => <EmptyPage />}
                />
            </Box>
        </Container>
    );
}
