import { Paging } from '@Core';
import moment from 'moment';
import { v4 } from 'uuid';
export * from './axiosHelper';
export * from './wait';

export const _weekdays = [1, 2, 3, 4, 5, 6, 0];

export const getDateWithWeekday = (startDate = new Date(), weekday: number) => {
    const _weekday = weekday === 0 ? 7 : weekday;
    return moment(startDate).isoWeekday(_weekday).startOf('date').toDate();
};

export const getWeekday = (startDate?: Date) => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
        arr.push({
            weekday: _weekdays[i],
            date: moment(startDate)
                .startOf('week')
                .add(i + 1, 'day')
                .toDate(),
        });
    }

    return arr;
};

export const fakeArray = (length: number) => {
    return [...new Array(length)].map((_) => ({ id: v4() }));
};
export const formatDate = (date: Date) => moment(date).format('DD/MM/YYYY');
export const formatNumber = (value: number) => value.toLocaleString();
export function defaultPaging<T>(params?: Partial<Paging<T>>): Paging<T> {
    return {
        page: 1,
        pageSize: 10,
        rows: [],
        total: 0,
        totalPages: 1,
        ...params,
    };
}

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}
