import StyledSelect from '@components/select-search/StyledSelect';
import { subRegionController, wardenController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging, formatDate } from '@helpers';
import { CountrySubRegion } from '@LocationOps/model';
import { Avatar, Box, Button, Grid, Stack, Typography } from '@mui/material';
import SelectOption from '@pages/rota-coverage/components/SelectOption';
import { Warden } from '@WardenOps/model';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { RowInformation, useWarden } from '../WardenDetails';
export type Filter = {
    subRegion?: any;
};
export default function PersonalInformation() {
    const { t } = useTranslation();
    const { warden, setWarden } = useWarden();
    const [subRegions, setSubRegions] = useState<Paging<CountrySubRegion>>(defaultPaging({ pageSize: 10 }));

    const [filter, setFilter] = useState<Filter>({});

    const handleChange = (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
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
        (async () => {
            if (warden.Id) {
                await subRegionController.list({}).then((res) => {
                    const _filter = res.rows.find((s) => s.Id === warden.CountrySubRegionId);
                    setFilter({ subRegion: _filter });
                    setSubRegions(res);
                });
            }
        })();
    }, [warden.Id]);

    return (
        <Grid
            container
            xs={12}
            sx={{
                border: '1px solid #DDDDDD',
                borderRadius: '0px 8px 8px 8px;',
                p: '40px 16px',
            }}
        >
            <Grid item xs={4} pr={2}>
                <Stack
                    width="100%"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        height: '100%',
                        background: '#FAFAFA',
                        p: '32px 16px',
                        borderRadius: 1,
                    }}
                    gap={1}
                >
                    <Avatar
                        src={warden.Picture ?? ''}
                        alt=""
                        sx={{
                            width: 100,
                            height: 100,
                            border: '8px solid rgba(52, 121, 187, 0.1)',
                        }}
                    />
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                width: 8,
                                height: 8,
                                background: '#009D4F',
                                borderRadius: '100%',
                            }}
                        />
                        <Typography variant="body1">{t('wardenDetailsPage.text.active')}</Typography>
                    </Stack>
                    <Stack width="100%" mt={3} gap={1}>
                        <RowInformation title={t('wardenDetailsPage.text.fullName')} content={warden.FullName} />
                        <RowInformation title={t('wardenDetailsPage.text.email')} content={warden.Email} />
                        <RowInformation title={t('wardenDetailsPage.text.phoneNumber')} content={warden.PhoneNumber} />
                        <RowInformation title={t('wardenDetailsPage.text.postCode')} content={warden.Postcode} />
                    </Stack>
                </Stack>
            </Grid>
            <Grid
                item
                xs={8}
                sx={{
                    background: '#FAFAFA',
                }}
            >
                <Stack
                    width="100%"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                        p: '32px 16px',
                        borderRadius: 1,
                    }}
                    gap={1}
                >
                    <Typography variant="h4" color="#85858A" mt={1.5}>
                        {t('wardenDetailsPage.title.workingSummary')}
                    </Typography>
                    <Stack
                        width="100%"
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            background: '#FFFFFF',
                            p: 2,
                            borderRadius: 1,
                        }}
                        mt={3}
                    >
                        <Stack width="100%" gap={1}>
                            <RowInformation
                                title={t('wardenDetailsPage.text.wardenNumber')}
                                content={warden.ExternalId}
                            />
                            <RowInformation
                                title={t('wardenDetailsPage.text.iWardenNumber')}
                                content={warden.IWardenNumber}
                            />
                            <RowInformation
                                title={t('wardenDetailsPage.text.contractedHours')}
                                content={warden.ContractHours}
                            />
                            <RowInformation
                                title={t('wardenDetailsPage.text.startDate')}
                                content={formatDate(warden.StartDate ?? new Date())}
                            />
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography variant="body1">Working area:</Typography>
                                <StyledSelect
                                    label="Sub-region"
                                    disabledSearch
                                    data={subRegions.rows}
                                    value={filter.subRegion}
                                    hasMore={subRegions.page < subRegions.totalPages}
                                    next={onGetMoreSubRegions}
                                    onChange={(option) => {
                                        handleChange({ subRegion: option });
                                    }}
                                    renderValue={(value) => {
                                        return (
                                            <Typography noWrap>{value?.Name || 'Please select sub-region'}</Typography>
                                        );
                                    }}
                                    // renderDefaultOption={() => <DefaultOption title="Unassigned" />}
                                    renderOption={(option) => <SelectOption option={option} isDisplay={false} />}
                                    sx={{ minWidth: 230 }}
                                />
                            </Stack>
                            <Stack width="100%" direction="row" justifyContent="flex-end" pt={3}>
                                <Button
                                    variant="contained"
                                    sx={{ flexBasis: 280 }}
                                    onClick={async () => {
                                        const _warden: Warden = { ...warden, CountrySubRegionId: filter.subRegion.Id };
                                        await wardenController.upsert(_warden).then((res) => {
                                            setWarden(res);
                                            toast.success('Save successfully!');
                                        });
                                    }}
                                    disabled={
                                        Boolean(filter.subRegion === undefined) ||
                                        Boolean(warden.CountrySubRegionId === filter.subRegion.Id)
                                    }
                                >
                                    Save
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </Grid>
        </Grid>
    );
}
