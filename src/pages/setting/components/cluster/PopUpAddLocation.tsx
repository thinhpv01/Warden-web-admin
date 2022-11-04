import Checkbox from '@components/Checkbox';
import { CStack } from '@components/FlexedStack';
import PopUpBase from '@components/PopUpBase';
import { locationController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging } from '@helpers';
import useDebounceSearch from '@hooks/useDebounceSearch';
import usePopUp, { IPopUp } from '@hooks/usePopUp';
import { LocationWithRelations } from '@LocationOps/model';
import { Pagination, Stack, TextField, Typography } from '@mui/material';
import { difference, differenceBy } from 'lodash';
import { useEffect, useState } from 'react';
import PopUpViewMore from './PopUpViewMore';

type Props = Omit<IPopUp, 'onConfirm'> & {
    subRegionId?: number;
    selectedLocations: LocationWithRelations[];
    onConfirm: (locations: LocationWithRelations[]) => void;
};

export default function PopUpAddLocation(props: Props) {
    const [locations, setLocations] = useState<LocationWithRelations[]>(props.selectedLocations);
    const [query, setQuery] = useState({ page: 1, pageSize: 5 });
    const [pagingLocation, setPagingLocation] = useState<Paging<LocationWithRelations>>(defaultPaging());

    function handleSelectLocation(location: LocationWithRelations) {
        const isExist = locations.some((l) => l.Id === location.Id);
        if (isExist) setLocations(locations.filter((l) => l.Id !== location.Id));
        else setLocations((p) => [...p, location]);
    }

    useEffect(() => {
        props.subRegionId &&
            locationController
                .list({
                    ...query,
                    filter: { LocationType: 'mobile', CountrySubRegionId: props.subRegionId },
                })
                .then((res) => setPagingLocation(res));
    }, [props.subRegionId, query]);

    useEffect(() => {
        setLocations(props.selectedLocations);
    }, [props.selectedLocations]);

    const handleChangeSearch = (value: string) => {
        locationController
            .list({
                ...query,
                page: 1,
                filter: { LocationType: 'mobile', CountrySubRegionId: props.subRegionId },
                search: {
                    content: value,
                    fields: ['Name'],
                },
            })
            .then((res) => setPagingLocation(res));
    };

    const debSearch = useDebounceSearch({
        onSearch: handleChangeSearch,
    });

    useEffect(() => {
        if (props.open && debSearch.value) {
            debSearch.setValue('');
        }
    }, [props.open]);

    const popUpViewMore = usePopUp();

    return (
        <PopUpBase
            open={props.open}
            dialogProps={{ fullWidth: true, maxWidth: 'sm' }}
            onClose={props.onClose}
            onConfirm={() => {
                props.onConfirm?.(locations);
            }}
            title={'Add mobile sites to cluster'}
            subTitle={
                <Stack>
                    <Typography color="GrayText" variant="caption">
                        Selected {locations.length} sites{' '}
                        <Typography
                            component={'span'}
                            color="primary.main"
                            sx={{ cursor: 'pointer' }}
                            onClick={popUpViewMore.setTrue}
                        >
                            (View)
                        </Typography>
                    </Typography>
                </Stack>
            }
            subTitleProps={{ sx: { color: 'gray' } }}
            minWidthButton={150}
            desc={
                <Stack mt={1}>
                    <Stack>
                        <TextField
                            size="small"
                            label="Search by name"
                            value={debSearch.value}
                            onChange={(e) => debSearch.handleChange(e.target.value)}
                        />
                    </Stack>

                    <Stack mt={2}>
                        {pagingLocation.rows.map((l) => {
                            // const disabled = props.selectedLocations.some((lc) => lc.Id === l.Id);
                            const disabled = false;
                            return (
                                <Stack
                                    key={l.Id}
                                    direction="row"
                                    spacing={'12px'}
                                    alignItems="center"
                                    sx={{
                                        padding: 1,
                                        borderBottom: '1px solid #eee',
                                        cursor: !disabled ? 'pointer' : undefined,
                                        ':hover': {
                                            bgcolor: '#eee',
                                        },
                                        transition: '0.25s',
                                        borderRadius: '5px',
                                        backgroundColor: disabled ? '#eee' : undefined,
                                    }}
                                    onClick={() => !disabled && handleSelectLocation(l)}
                                >
                                    <Stack>
                                        <Checkbox
                                            checked={locations.some((lc) => lc.Id === l.Id)}
                                            disabled={disabled}
                                        />
                                    </Stack>

                                    <Stack>
                                        <Typography>{l.Name}</Typography>
                                        <Typography variant="caption" color="GrayText">
                                            Region: {l.CountryRegion?.Name} | Sub-region: {l.CountrySubRegion?.Name} |
                                            Location ID: {l.Id}
                                        </Typography>
                                        <Typography variant="caption" color="GrayText">
                                            Address: {l.Address}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            );
                        })}

                        {!!pagingLocation.rows.length ? (
                            pagingLocation.totalPages === 1 ? null : (
                                <CStack mt={2}>
                                    <Pagination
                                        shape="rounded"
                                        count={pagingLocation.totalPages}
                                        page={pagingLocation.page}
                                        onChange={(_, page) => {
                                            setQuery((p) => ({ ...p, page }));
                                        }}
                                    />
                                </CStack>
                            )
                        ) : (
                            <CStack>
                                <Typography color={'GrayText'} textAlign="center">
                                    No result!
                                </Typography>
                            </CStack>
                        )}
                    </Stack>

                    <PopUpViewMore {...popUpViewMore} locations={locations} onDelete={handleSelectLocation} />
                </Stack>
            }
        />
    );
}
