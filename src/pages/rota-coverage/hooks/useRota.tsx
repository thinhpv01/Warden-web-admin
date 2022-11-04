import { rotaCoverageController } from '@controllers';
import { Paging } from '@Core';
import useDebounceSearch from '@hooks/useDebounceSearch';
import usePopUp from '@hooks/usePopUp';
import {
    ClusterWithRelations,
    CountryRegion,
    CountryRegionWithRelations,
    CountrySubRegion,
    CountrySubRegionWithRelations,
    Location,
    LocationType,
    LocationWithRelations,
    RotaCoverage,
    RotaCoveragePeriod,
} from '@LocationOps/model';
import { UNIT } from '@pages/setting/components/location/LocationDetails';
import { uniq } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { defaultPeriod, Shift, ShiftStatus } from 'src/components/rota-table';
import { defaultPaging, getDateWithWeekday } from 'src/helpers';
import { v4 } from 'uuid';

type Props = {
    locationType: LocationType;
};

export type Filter = {
    startDate: Date;
    region?: CountryRegion;
    subRegion?: CountrySubRegion;
    location?: Location;
    cluster?: ClusterWithRelations;
};

export type State = {
    regions: Paging<CountryRegionWithRelations>;
    subRegions: Paging<CountrySubRegionWithRelations>;
    locations: Paging<LocationWithRelations>;
    cluster: Paging<ClusterWithRelations>;
};

export type ShiftRota = Shift & {
    exceed?: number;
    missing?: number;
    rota?: RotaCoveragePeriod;
    weekday: number;
};

export default function useRota(props: Props) {
    const [data, setData] = useState<RotaCoverage[]>([]);

    const [filter, setFilter] = useState<Filter>({
        startDate: moment().weekday(1).toDate(),
    });

    const [state, setState] = useState<State>({
        locations: defaultPaging({ pageSize: 50 }),
        regions: defaultPaging({ pageSize: 50 }),
        subRegions: defaultPaging({ pageSize: 50 }),
        cluster: defaultPaging({ pageSize: 50 }),
    });

    const convertedData = (data: RotaCoverage[], startDate: Date) => {
        let converted: Record<string, ShiftRota[]> = { ...defaultPeriod } as Record<string, ShiftRota[]>;

        data.forEach((value) => {
            converted[value.Weekday] = value.Periods.map(
                (p) =>
                    ({
                        start: p.TimeFrom / UNIT,
                        end: p.TimeTo / UNIT,
                        weekday: value.Weekday,
                        requiredWarden: p.RequireWarden,
                        status: p.Missing === 0 ? ShiftStatus.full : ShiftStatus.notFull,
                        exceed: p.Exceed,
                        missing: p.Missing,
                        fakeId: v4(),
                        date: getDateWithWeekday(startDate, value.Weekday),
                        rota: p,
                        assignedWardens: p.Wardens,
                    } as ShiftRota)
            );
        });

        return converted;
    };

    const baseFilter = {
        TimeFrom: filter.startDate,
        LocationType: props.locationType,
        pageSize: 50,
    };

    const handleChange = (filter: Partial<Filter>) => {
        const isDefaultValue = Boolean(Object.keys(filter.location ?? ({} as any)).length <= 0);
        if (isDefaultValue) {
            debSearchLocation.setValue('');
        }
        setFilter((prev) => ({ ...prev, ...filter }));
    };

    function concatPaging<T>(old: Paging<T>, newPaging: Paging<T>) {
        return { ...newPaging, rows: old.rows.concat(newPaging.rows) } as Paging<T>;
    }

    const fetchMoreRegions = async () => {
        const { page } = state['regions'];
        rotaCoverageController
            .listRegionMissingWarden({
                ...baseFilter,
                page: page + 1,
            })
            .then((res) => setState((p) => ({ ...p, regions: concatPaging(p.regions, res) })));
    };

    const fetchMoreSubRegions = async () => {
        const { page } = state['subRegions'];
        rotaCoverageController
            .listSubRegionMissingWarden({
                ...baseFilter,
                page: page + 1,
                filter: {
                    CountryRegionId: filter.region?.Id,
                },
            })
            .then((res) => setState((p) => ({ ...p, subRegions: concatPaging(p.subRegions, res) })));
    };

    const fetchMoreCluster = async () => {
        const { page } = state['cluster'];
        rotaCoverageController
            .listClusterMissingWarden({
                ...baseFilter,
                page: page + 1,
                RegionId: filter.region?.Id,
            })
            .then((res) => setState((p) => ({ ...p, cluster: concatPaging(p.cluster, res) })));
    };

    const locationFilter = {
        RegionId: filter.region?.Id,
        SubRegionId: filter.subRegion?.Id,
        LocationType: props.locationType,
    };

    const fetchMoreLocations = async () => {
        const { page } = state['locations'];
        rotaCoverageController
            .listLocationMissingWarden({
                ...baseFilter,
                page: page + 1,
                filter: locationFilter,
            })
            .then((res) => setState((p) => ({ ...p, locations: concatPaging(p.locations, res) })));
    };

    const handleChangeSearchLocation = (value: string) => {
        rotaCoverageController
            .listLocationMissingWarden({
                ...baseFilter,
                page: 1,
                filter: locationFilter,
                search: { content: value, fields: ['Name'] },
            })
            .then((res) => setState((p) => ({ ...p, locations: res })));
    };

    const debSearchLocation = useDebounceSearch({ onSearch: handleChangeSearchLocation });

    const hasMore = (field: keyof State) => {
        return state[field].page < state[field].totalPages;
    };

    const [random, setRandom] = useState(Math.random());
    const reGetList = () => setRandom(Math.random());

    useEffect(() => {
        const init = async () => {
            rotaCoverageController
                .getRotaCoverage({
                    TimeFrom: filter.startDate,
                    RegionId: filter.region?.Id,
                    SubRegionId: filter.subRegion?.Id,
                    LocationType: [props.locationType],
                    LocationId: filter.location?.Id,
                    ClusterId: filter.cluster?.Id,
                })
                .then((res) => {
                    setData(res);
                });
        };

        init();
    }, [filter, props.locationType, random]);

    // Get location
    useEffect(() => {
        rotaCoverageController
            .listLocationMissingWarden({
                TimeFrom: filter.startDate,
                filter: {
                    CountryRegionId: filter.region?.Id,
                    CountrySubRegionId: filter.subRegion?.Id,
                    LocationType: props.locationType,
                    ClusterId: filter.cluster?.Id,
                },
            })
            .then((res) => setState((p) => ({ ...p, locations: res })));
    }, [filter.subRegion, filter.region, props.locationType, filter.cluster?.Id, filter.startDate, random]);

    // Get sub-region / cluster
    useEffect(() => {
        if (props.locationType === 'static')
            rotaCoverageController
                .listSubRegionMissingWarden({
                    LocationType: props.locationType,
                    TimeFrom: filter.startDate,
                    filter: {
                        CountryRegionId: filter.region?.Id,
                    },
                })
                .then((res) => setState((p) => ({ ...p, subRegions: res })));

        if (props.locationType === 'mobile')
            rotaCoverageController
                .listClusterMissingWarden({
                    LocationType: props.locationType,
                    TimeFrom: filter.startDate,
                    RegionId: filter.region?.Id,
                })
                .then((res) => setState((p) => ({ ...p, cluster: res })));
    }, [filter.region, filter.startDate, props.locationType, random]);

    // Get region
    useEffect(() => {
        rotaCoverageController
            .listRegionMissingWarden({
                LocationType: props.locationType,
                TimeFrom: filter.startDate,
                pageSize: 50,
            })
            .then((res) => setState((r) => ({ ...r, regions: res })));
    }, [filter.startDate, props.locationType, random]);

    const converted = convertedData(data, filter.startDate);

    const missingHours = data.reduce((prev, cur) => {
        return prev + (cur.MissingHours ?? 0);
    }, 0);

    const missingWarden = data.reduce((prev, cur) => {
        return (
            prev +
            (cur.Periods.reduce((prev, cur) => {
                return prev + cur.Missing;
            }, 0) ?? 0)
        );
    }, 0);

    const assignedWarden = data.reduce((prev, cur) => {
        return (
            prev +
            cur.Periods.reduce((p, c) => {
                return p + (c.Wardens?.length ?? 0);
            }, 0)
        );
    }, 0);

    const fullCoverage = missingHours === 0;

    console.log(`converted`, converted);
    const popUpEditCalendar = usePopUp();
    const popUpAssignWarden = usePopUp();

    const [selected, setSelected] = useState<{ shift?: ShiftRota }>({});

    const availableDays = useMemo(() => {
        const arr: number[] = [];
        if (!selected.shift) return arr;

        Object.entries(converted).forEach(([key, shifts], index) => {
            console.log(`key`, key, shifts);

            shifts.forEach((shift) => {
                if (
                    shift.start >= selected.shift!.start &&
                    shift.end <= selected.shift!.end &&
                    moment(shift.date).isSameOrAfter(moment().startOf('date'))
                ) {
                    arr.push(Number(key));
                }
            });
        });

        return uniq(arr);
    }, [converted, selected.shift]);

    return {
        data,
        setData,
        filter,
        setFilter,
        state,
        setState,
        convertedData,
        handleChange,
        fetchMoreRegions,
        fetchMoreSubRegions,
        fetchMoreLocations,
        hasMore,
        converted,
        popUpEditCalendar,
        popUpAssignWarden,
        selected,
        setSelected,
        availableDays,
        fetchMoreCluster,
        debSearchLocation,
        missingWarden,
        missingHours,
        assignedWarden,
        fullCoverage,
        reGetList,
    };
}
