import { LocationRotaCoverage, OperationalPeriod, RotaCoverage, RotaCoveragePeriod } from '@LocationOps/model';
import { Rota, Warden } from '@WardenOps/model';
import moment from 'moment';
import * as lodash from 'lodash';

function mergePeriodsWithRotasByLocation(props: { rotas: Rota[]; periods: OperationalPeriod[] }) {
    const { rotas, periods } = props;
    const rotaConverted = rotas.map((rota) => {
        return {
            ...rota,
            Weekday: moment(rota.TimeFrom).weekday(),
            TimeFrom: moment(rota.TimeFrom).hour() * 60,
            TimeTo: moment(rota.TimeTo).hour() * 60,
        };
    });
    const rotaGroupByLocation = lodash.groupBy(rotaConverted, 'LocationId');
    Object.keys(rotaGroupByLocation).map((key) => {
        rotaGroupByLocation[key] = lodash.groupBy(rotaGroupByLocation[key], 'Weekday') as any;
    });
    const periodGroupByLocation = lodash.groupBy(periods, 'LocationId');
    Object.keys(periodGroupByLocation).map((key) => {
        periodGroupByLocation[key] = lodash.groupBy(periodGroupByLocation[key], 'Weekday') as any;
    });
    const result = Object.keys(periodGroupByLocation).map((lKey) => {
        const RotaCoverage: RotaCoverage[] = Object.keys(periodGroupByLocation[lKey]).map((wKey) => {
            const wKeyNumber = Number(wKey);
            const haveRotas = rotaGroupByLocation[lKey] && rotaGroupByLocation[lKey][wKeyNumber];
            const periodPoints = (periodGroupByLocation[lKey][wKeyNumber] as any)
                .map((period: OperationalPeriod) => [period.TimeFrom, period.TimeTo])
                .flat()
                .sort((init: number, next: number) => init - next);
            const rotaPoints = haveRotas
                ? (rotaGroupByLocation[lKey][wKeyNumber] as any)
                      .map((rota: Rota) => [rota.TimeFrom, rota.TimeTo])
                      .flat()
                : [];
            const minPeriodPoint = periodPoints[0];
            const maxPeriodPoint = periodPoints[periodPoints.length - 1];
            const breakpoints = lodash
                .uniq(periodPoints.concat(rotaPoints))
                .filter((point: any) => point >= minPeriodPoint && point <= maxPeriodPoint)
                .sort((init: any, next: any) => init - next) as number[];
            const Periods = (periodGroupByLocation[lKey][wKeyNumber] as any)
                .map((period: OperationalPeriod) => {
                    const newPeriodPoints = breakpoints.filter(
                        (point) => point >= period.TimeFrom && point <= period.TimeTo
                    );
                    const newPeriodLength = newPeriodPoints.length - 1;
                    return Array.from(new Array(newPeriodLength)).map((o, iPoint) => {
                        const TimeFrom = newPeriodPoints[iPoint];
                        const TimeTo = newPeriodPoints[iPoint + 1];
                        const workings: Rota[] = haveRotas
                            ? (rotaGroupByLocation[lKey][wKeyNumber] as any).filter(
                                  (rota: Rota) =>
                                      TimeFrom >= (rota.TimeFrom as any as number) &&
                                      TimeTo <= (rota.TimeTo as any as number)
                              )
                            : [];
                        let Exceed = 0;
                        let Missing = 0;
                        let Working = workings.length;
                        let Wardens: Warden[] = [];
                        if (Working > 0) {
                            workings.map((rota) => {
                                if (rota.Warden) Wardens.push(rota.Warden);
                            });
                        }
                        if (Working > period.RequireWarden) {
                            Exceed = Working - period.RequireWarden;
                        }
                        if (Working < period.RequireWarden) {
                            Missing = period.RequireWarden - Working;
                        }
                        const rotaCoverage: RotaCoveragePeriod = {
                            ...period,
                            TimeFrom,
                            TimeTo,
                            Working,
                            Exceed,
                            Missing,
                            Wardens,
                        };
                        return rotaCoverage;
                    });
                })
                .flat();
            return {
                Weekday: Number(wKey),
                Periods,
            };
        });
        return {
            LocationId: Number(lKey),
            RotaCoverage,
        } as LocationRotaCoverage;
    });
    return result;
}

function mergePeriodsWithRotasByWeekday(locationRotasCoverages: LocationRotaCoverage[]) {
    const rataCoverages = locationRotasCoverages
        .map((location) => location.RotaCoverage.map((rota) => rota.Periods).flat())
        .flat();
    const weekPeriod = lodash.groupBy(rataCoverages, 'Weekday');
    const result: RotaCoverage[] = Object.keys(weekPeriod).map((wKey) => {
        const breakpoints = weekPeriod[wKey].map((period) => [period.TimeFrom, period.TimeTo]).flat();
        const uniqBreakpoints = lodash.uniq(breakpoints).sort((init, next) => init - next);
        const Periods: RotaCoveragePeriod[] = Array.from(new Array(uniqBreakpoints.length - 1))
            .map((p, iPoint) => {
                const TimeFrom = uniqBreakpoints[iPoint];
                const TimeTo = uniqBreakpoints[iPoint + 1];
                let RequireWarden = 0;
                let Exceed = 0;
                let Missing = 0;
                let Working = 0;
                let Wardens: Warden[] = [];
                for (let index = 0; index < weekPeriod[wKey].length; index++) {
                    const shift = weekPeriod[wKey][index];
                    const condition = TimeFrom >= shift.TimeFrom && TimeTo <= shift.TimeTo;
                    if (condition) {
                        RequireWarden += shift.RequireWarden;
                        Exceed += shift.Exceed;
                        Missing += shift.Missing;
                        Working += shift.Working;
                        if (shift.Wardens && shift.Wardens.length > 0) {
                            Wardens = Wardens.concat(shift.Wardens);
                        }
                    }
                }
                return {
                    TimeFrom,
                    TimeTo,
                    RequireWarden,
                    Working,
                    Exceed,
                    Missing,
                    Wardens,
                };
            })
            .filter((period) => period.RequireWarden !== 0);
        return {
            Weekday: Number(wKey),
            Periods,
        };
    });
    return result;
}

export { mergePeriodsWithRotasByLocation, mergePeriodsWithRotasByWeekday };
