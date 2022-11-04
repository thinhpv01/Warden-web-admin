import { Paging } from '@Core';
import { CountryRegion, CountrySubRegion } from '@LocationOps/model';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import IcSearch from 'src/components/icon/IcSearch';
import StyledSelect from 'src/components/select-search/StyledSelect';
import DefaultOption from 'src/pages/rota-coverage/components/DefaultOption';
import SelectOption from 'src/pages/rota-coverage/components/SelectOption';
export type Filter = {
    region?: any;
    subRegion?: any;
    locationType?: any;
    // key?: string;
};
type Props = {
    regions: Paging<CountryRegion>;
    subRegions: Paging<CountrySubRegion>;
    filter: Filter;
    handleChange(filter: Partial<Filter>): void;
    onChangeSearch(key: string): void;
    onGetMoreRegions(): void;
    onGetMoreSubRegions(): void;
};
export default function FilterLocation(props: Props) {
    const locationTypes = [
        { Name: 'Static', Value: 'static' },
        { Name: 'Mobile', Value: 'mobile' },
        { Name: 'Uncategory', Value: null },
    ];
    const { t } = useTranslation();
    return (
        <Stack width="100%" direction="row" gap={2} mt={1}>
            <FormControl
                fullWidth
                variant="outlined"
                size="small"
                onChange={(e: any) => {
                    props.onChangeSearch(e.target.value);
                }}
            >
                <InputLabel htmlFor="outlined-adornment" sx={{ color: '#DDDDDD' }}>
                    {t('locationPage.text.searchBy')}
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
                    label={t('locationPage.text.searchBy')}
                    sx={{ py: '1.5px' }}
                />
            </FormControl>
            <StyledSelect
                label="Region"
                disabledSearch
                data={props.regions.rows}
                value={props.filter.region}
                hasMore={Boolean(props.regions.page < props.regions.totalPages)}
                next={props.onGetMoreRegions}
                onChange={(option) => {
                    props.handleChange({ region: option, subRegion: undefined });
                }}
                renderValue={(value) => {
                    return <Typography noWrap>{value?.Name || 'All regions'}</Typography>;
                }}
                renderDefaultOption={() => <DefaultOption title="All regions" />}
                renderOption={(option) => <SelectOption option={option} isDisplay={false} />}
                sx={{
                    width: '30%',
                }}
            />

            <StyledSelect
                label="Sub-region"
                disabledSearch
                data={props.subRegions.rows}
                value={props.filter.subRegion}
                hasMore={Boolean(props.subRegions.page < props.subRegions.totalPages)}
                next={props.onGetMoreSubRegions}
                onChange={(option) => {
                    props.handleChange({ subRegion: option });
                }}
                renderValue={(value) => {
                    return <Typography noWrap>{value?.Name || 'All sub-regions'}</Typography>;
                }}
                renderDefaultOption={() => <DefaultOption title="All sub-regions" />}
                renderOption={(option) => <SelectOption option={option} isDisplay={false} />}
                sx={{
                    width: '100%',
                }}
            />
            <StyledSelect
                label="Type"
                disabledSearch
                data={locationTypes}
                value={props.filter.locationType}
                hasMore={true}
                next={() => {}}
                onChange={(option) => {
                    props.handleChange({ locationType: option });
                }}
                renderValue={(value) => {
                    return <Typography noWrap>{value?.Name || 'All types'}</Typography>;
                }}
                renderDefaultOption={() => <DefaultOption title="All types" />}
                renderOption={(option) => <SelectOption option={option} isDisplay={false} />}
                sx={{
                    width: '30%',
                }}
            />
        </Stack>
    );
}
