import { CStack } from '@components/FlexedStack';
import PopUpAssignWarden from '@components/rota-table/PopUpAssignWarden';
import PopUpEditCalendar from '@components/rota-table/PopUpEditCalendar';
import { formatNumber } from '@helpers';
import { Avatar, Fade, Grow, Stack, Typography } from '@mui/material';
import moment from 'moment';
import RotaTable from 'src/components/rota-table';
import StyledShift from 'src/components/rota-table/Shift';
import StyledSelect from 'src/components/select-search/StyledSelect';
import { v4 } from 'uuid';
import DefaultOption from '../components/DefaultOption';
import FilterDate from '../components/FilterDate';
import SelectOption from '../components/SelectOption';
import ShiftActions from '../components/ShiftActions';
import useRota, { ShiftRota } from '../hooks/useRota';

type Props = {};

export default function StaticRota({}: Props) {
    const rotaHook = useRota({ locationType: 'static' });
    const isReadOnly = (option: ShiftRota) => {
        const dateOption = moment(option.date).format('YYYY-MM-DD');
        const today = moment(new Date()).format('YYYY-MM-DD');
        const value = moment(dateOption).isBefore(today);
        return value || !rotaHook.filter.location;
    };
    return (
        <Stack>
            <Stack direction={'row'} justifyContent="space-between" alignItems={'center'}>
                <Typography variant="h3">Static rota coverage</Typography>
                <FilterDate
                    startDate={rotaHook.filter.startDate}
                    onChange={(startDate) => rotaHook.handleChange({ startDate })}
                />
            </Stack>

            <Stack mt={5} direction={'row'} spacing={1}>
                <StyledSelect
                    label="Region"
                    disabledSearch
                    sx={{ width: 370 }}
                    data={rotaHook.state.regions.rows}
                    value={rotaHook.filter.region}
                    hasMore={rotaHook.hasMore('regions')}
                    next={rotaHook.fetchMoreRegions}
                    onChange={(option) => {
                        rotaHook.handleChange({ region: option, subRegion: undefined, location: undefined });
                    }}
                    renderValue={(value) => {
                        return (
                            <Typography noWrap>
                                {value?.Name || `All regions (${rotaHook.state.regions.total})`}
                            </Typography>
                        );
                    }}
                    renderDefaultOption={() => <DefaultOption title="All regions" />}
                    renderOption={(option) => <SelectOption option={option} />}
                />

                <StyledSelect
                    label="Sub-region"
                    sx={{ width: 400 }}
                    // listProps={{ style: { width: 250 } }}
                    disabledSearch
                    data={rotaHook.state.subRegions.rows}
                    value={rotaHook.filter.subRegion}
                    hasMore={rotaHook.hasMore('subRegions')}
                    next={rotaHook.fetchMoreSubRegions}
                    onChange={(option) => {
                        rotaHook.handleChange({ subRegion: option, location: undefined });
                    }}
                    renderValue={(value) => {
                        return (
                            <Typography noWrap>
                                {value?.Name || `All sub-regions (${rotaHook.state.subRegions.total})`}
                            </Typography>
                        );
                    }}
                    renderDefaultOption={() => <DefaultOption title="All sub-regions" />}
                    renderOption={(option) => <SelectOption option={option} />}
                />

                <StyledSelect
                    label="Location"
                    sx={{ width: '100%' }}
                    data={rotaHook.state.locations.rows}
                    value={rotaHook.filter.location}
                    hasMore={rotaHook.hasMore('locations')}
                    next={rotaHook.fetchMoreLocations}
                    onChange={(option) => {
                        rotaHook.handleChange({ location: option });
                    }}
                    searchValue={rotaHook.debSearchLocation.value}
                    onChangeSearch={(text) => {
                        rotaHook.debSearchLocation.handleChange(text);
                    }}
                    renderValue={(value) => {
                        return (
                            <Typography noWrap>
                                {value?.Name || `All locations (${rotaHook.state.locations.total})`}
                            </Typography>
                        );
                    }}
                    renderDefaultOption={() => <DefaultOption title="All locations" />}
                    renderOption={(option) => <SelectOption option={option} />}
                />
            </Stack>

            {rotaHook.filter.location && (
                <Grow in={true}>
                    <div>
                        <CStack mt={2} sx={{ bgcolor: 'error.light', borderRadius: '5px', py: 1.5 }}>
                            <Typography color="error.main">
                                You can assign a warden for a period by click on yellow area.
                            </Typography>
                        </CStack>
                    </div>
                </Grow>
            )}

            {!rotaHook.filter.location && (
                <Fade in={true}>
                    <Stack
                        mt={2}
                        direction={'row'}
                        justifyContent="space-between"
                        sx={{
                            '& > *': {
                                color: rotaHook.fullCoverage ? 'primary.main' : 'error.main',
                            },
                        }}
                    >
                        {rotaHook.fullCoverage ? (
                            <>
                                <Typography>All locations are full-coverage!</Typography>
                                <Typography>Total assigned wardens: {rotaHook.assignedWarden}</Typography>
                            </>
                        ) : (
                            <>
                                <Typography>NOT full-coverage hours: {formatNumber(rotaHook.missingHours)}</Typography>
                                <Typography>Est. required wardens: {rotaHook.missingWarden}</Typography>
                            </>
                        )}
                    </Stack>
                </Fade>
            )}

            <Stack mt={2}>
                <RotaTable
                    hideLieuLeave
                    startDate={rotaHook.filter.startDate}
                    data={rotaHook.converted}
                    renderOption={(option, index, arr) => {
                        return (
                            <StyledShift
                                readonlyOutside
                                readonly={isReadOnly(option)}
                                arrLength={arr.length}
                                index={index}
                                shift={option}
                                renderHover={
                                    !!option.rota?.Wardens?.length &&
                                    rotaHook.filter.location && (
                                        <Stack
                                            direction={'row'}
                                            sx={{ background: '#85858A', borderRadius: '100px', p: '3px' }}
                                            spacing={'3px'}
                                        >
                                            {option.rota?.Wardens?.map((w) => {
                                                return (
                                                    <Avatar
                                                        key={v4()}
                                                        src={w.Picture}
                                                        sx={{ width: 30, height: 30 }}
                                                    ></Avatar>
                                                );
                                            })}
                                        </Stack>
                                    )
                                }
                                renderActions={(shift) => (
                                    <ShiftActions
                                        shift={shift}
                                        onEdit={(shift) => {
                                            console.log(`shift 11`, shift);
                                            rotaHook.setSelected((prev) => ({ ...prev, shift }));
                                            rotaHook.popUpEditCalendar.setTrue();
                                        }}
                                        onAddWarden={(shift) => {
                                            rotaHook.setSelected((prev) => ({ ...prev, shift }));
                                            rotaHook.popUpAssignWarden.setTrue();
                                        }}
                                    />
                                )}
                                renderTitleShift={(shift) => `${shift?.missing ?? 0}(${shift?.requiredWarden ?? 0})`}
                            />
                        );
                    }}
                />

                {rotaHook.selected.shift && rotaHook.filter.location && (
                    <PopUpEditCalendar
                        {...rotaHook.popUpEditCalendar}
                        shift={rotaHook.selected.shift}
                        location={rotaHook.filter.location}
                        onConfirm={(r) => {
                            rotaHook.reGetList();
                            rotaHook.popUpEditCalendar.onClose();
                        }}
                    />
                )}

                {rotaHook.selected.shift && rotaHook.filter.location && (
                    <PopUpAssignWarden
                        {...rotaHook.popUpAssignWarden}
                        location={rotaHook.filter.location}
                        shift={rotaHook.selected.shift}
                        startDate={rotaHook.filter.startDate}
                        availableDays={rotaHook.availableDays}
                        onConfirmed={(r) => {
                            rotaHook.reGetList();
                            rotaHook.popUpAssignWarden.onClose();
                        }}
                    />
                )}
            </Stack>
        </Stack>
    );
}
