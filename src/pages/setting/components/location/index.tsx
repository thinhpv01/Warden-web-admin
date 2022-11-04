import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import { locationController, regionController, subRegionController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging } from '@helpers';
import { CountryRegion, CountrySubRegion, Location } from '@LocationOps/model';
import { Box, Container, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';
import BaseList from '../main/BaseList';
import EmptyPage from '../main/EmptyPage';
import FilterLocation, { Filter } from './FilterLocation';
import LocationCard from './LocationCard';


export default function LocationBase() {
    const theme = useTheme();
    const [locations, setLocations] = useState<Location[]>([]);
    const [regions, setRegions] = useState<Paging<CountryRegion>>(defaultPaging({ pageSize: 10 }));
    const [subRegions, setSubRegions] = useState<Paging<CountrySubRegion>>(defaultPaging({ pageSize: 10 }));
    const [filter, setFilter] = useState<Filter>({});
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [value, setValue] = useState('');
    const handleChange = (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
        setPage(1);
    };

    const debouncedValue = useDebounce<string>(value ?? '', 300);

    const onPageChange = (value: any) => {
        setPage(value);
        locationController
            .list({
                page: value,
                search: { content: debouncedValue as string, fields: ['Name'] },
                filter: {
                    CountryRegionId: filter.region?.Id,
                    CountrySubRegionId: filter.subRegion?.Id,
                    LocationType: filter.locationType?.Value,
                },
                pageSize: 10,
            })
            .then((res) => {
                setLocations(res.rows);
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
                filter: { CountryRegionId: filter.region?.Id },
            })
            .then((res) => {
                const _res = { ...res, rows: [...subRegions.rows, ...res.rows] };
                setSubRegions(_res);
            });
    };
    useEffect(() => {
        regionController.list({ pageSize: 10 }).then((res) => setRegions(res));
    }, []);

    useEffect(() => {
        subRegionController
            .list({ pageSize: 10, filter: { CountryRegionId: filter.region?.Id } })
            .then((res) => setSubRegions(res));
        locationController
            .list({
                search: { content: debouncedValue as string, fields: ['Name'] },
                filter: {
                    CountryRegionId: filter.region?.Id,
                    CountrySubRegionId: filter.subRegion?.Id,
                    LocationType: filter.locationType?.Value,
                },
                pageSize: 10,
            })
            .then((res) => {
                setLocations(res.rows);
                setTotalPage(res.totalPages);
                setPage(res.page);
            })
            .finally(() => setLoading(false));
    }, [filter, debouncedValue]);
    const breadcrumbs: IBreadCrumbs[] = [
        { title: 'Manage' },
        { title: 'Location' },
    ];
    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Typography fontSize={24}>Location</Typography>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <FilterLocation
                regions={regions}
                onGetMoreRegions={onGetMoreRegions}
                subRegions={subRegions}
                onGetMoreSubRegions={onGetMoreSubRegions}
                filter={filter}
                handleChange={handleChange}
                onChangeSearch={(key) => {
                    setValue(key);
                }}
            />
            <Box mt={2}>
                <BaseList
                    list={locations}
                    renderItem={(location) => <LocationCard location={location} />}
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
