import IcEdit from '@components/icon/IcEdit';
import { rotaTemplateController } from '@controllers';
import { Box, Button, Collapse, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Filter } from '@pages/rota-coverage/hooks/useRota';
import { Warden } from '@WardenOps/model';
import { cloneDeep } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiPlusSm } from 'react-icons/hi';
import { MdArrowDropUp } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import FilterDateRotaTemplate from './FilterDateRotaTemplate';
import RotaWeekly, { ScheduleWithStatus } from './RotaWeekly';

export default function WeeklySchedule(props: { warden?: Warden }) {
    const { t } = useTranslation();
    const params = useParams<{ id: string }>();
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState<Filter>({
        startDate: moment().startOf('isoWeek').add(1, 'weeks').toDate(),
    });

    const handleChange = (filter: Partial<Filter>) => {
        setFilter((prev) => ({ ...prev, ...filter }));
    };
    const [state, setState] = useState<ScheduleWithStatus[]>([]);
    const [isEdit, setIsEdit] = useState(false);

    const findIndex = (schedules: ScheduleWithStatus[], schedule: ScheduleWithStatus) =>
        schedules.findIndex((s) => s.fakeId === schedule.fakeId);

    const handleAdd = () => {
        setState((prev) => {
            const clonePrev = cloneDeep(prev);
            clonePrev.push({
                fakeId: v4(),
                defaultOpen: true,
                scheduleStatus: 'new',
                RotaTemplateDetails: [],
                WardenId: Number(params.id),
            } as any);
            return clonePrev;
        });
    };
    const toggleOpen = (schedule: ScheduleWithStatus) => {
        setState((prev) => {
            const newArr = prev.slice();
            const index = findIndex(prev, schedule);
            newArr[index].defaultOpen = !newArr[index].defaultOpen;
            return newArr;
        });
    };
    useEffect(() => {
        state.forEach((item, index) => {
            item.TimeStart = moment(filter.startDate).add(index, 'weeks').toDate();
            item.OrderIndex = index + 1;
        });
    }, [state, filter.startDate]);

    useEffect(() => {
        const init = async () => {
            await rotaTemplateController.list({ filter: { WardenId: params.id as any } }).then((res) =>
                setState(
                    res.rows.map((item) => ({
                        ...item,
                        fakeId: v4(),
                        RotaTemplateDetails: item.RotaTemplateDetails?.map((t) => ({ ...t, fakeId: v4() })),
                    }))
                )
            );
        };
        init();
    }, []);
    return (
        <Box width="100%" sx={{ background: '#FAFAFA', borderRadius: 2, p: 2 }} mt={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack
                    direction="row"
                    alignItems="center"
                    gap={2}
                    onClick={() => setOpen(!open)}
                    sx={{ cursor: 'pointer' }}
                >
                    <Box
                        sx={{
                            transform: `rotate(${open ? -180 : 0}deg)`,
                            color: '#85858A',
                            transition: 'all 0.3s',
                        }}
                    >
                        <MdArrowDropUp fontSize={20} />
                    </Box>
                    <Typography fontSize={20} fontWeight={500}>
                        {t('wardenDetailsPage.title.weeklySchedule')}
                        <Typography color="#85858A">
                            {t('wardenDetailsPage.text.contractedHours')}: {props.warden?.ContractHours}h/week
                        </Typography>
                    </Typography>
                </Stack>
                {open && (
                    <Stack direction="row" gap={1}>
                        <Tooltip title={'Edit'} placement="top" arrow>
                            <IconButton onClick={() => setIsEdit((prev) => !prev)} sx={{ width: 40 }}>
                                <IcEdit style={{ color: isEdit ? '#009D4F' : 'inherit' }} />
                            </IconButton>
                        </Tooltip>
                        <FilterDateRotaTemplate
                            startDate={filter.startDate}
                            onChange={(startDate) => handleChange({ startDate })}
                            isEdit={!isEdit}
                        />
                    </Stack>
                )}
            </Stack>
            <Collapse in={open}>
                {state
                    .sort((a, b) => a.OrderIndex - b.OrderIndex)
                    .map((item, index) => {
                        return (
                            <RotaWeekly
                                key={index + 's'}
                                schedule={item}
                                isEdit={isEdit}
                                onDelete={(schedule) => {
                                    setState((prev) => prev.filter((item) => item.fakeId !== schedule.fakeId));
                                }}
                                onToggle={toggleOpen}
                                onChange={(schedule) => {
                                    setState((prev) =>
                                        prev.map((item) => ({
                                            ...item,
                                            RotaTemplateDetails:
                                                item.fakeId === schedule.fakeId
                                                    ? schedule.RotaTemplateDetails
                                                    : item.RotaTemplateDetails,
                                        }))
                                    );
                                }}
                                warden={props.warden}
                            />
                        );
                    })}
                {isEdit && (
                    <Button
                        sx={{ mt: 1, height: 40 }}
                        startIcon={<HiPlusSm />}
                        onClick={handleAdd}
                        disabled={Boolean(state.length === 3)}
                    >
                        {t('wardenDetailsPage.button.addWeek')}
                    </Button>
                )}
                <Stack direction="row" alignItems="center" justifyContent="space-between" mt={2}>
                    <Button variant="outlined" onClick={() => setOpen(false)}>
                        {t('wardenDetailsPage.button.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!isEdit}
                        onClick={async () => {
                            await rotaTemplateController
                                .bulkUpsert({ list: state, WardenId: Number(params.id) })
                                .then((res) => {
                                    setState(
                                        res.map((item) => ({
                                            ...item,
                                            fakeId: v4(),
                                            RotaTemplateDetails: item.RotaTemplateDetails?.map((t) => ({
                                                ...t,
                                                fakeId: v4(),
                                            })),
                                        }))
                                    );
                                    setIsEdit(false);
                                    toast.success('Update schedule successfully!');
                                });
                        }}
                    >
                        {t('wardenDetailsPage.button.updateSchedule')}
                    </Button>
                </Stack>
            </Collapse>
        </Box>
    );
}
