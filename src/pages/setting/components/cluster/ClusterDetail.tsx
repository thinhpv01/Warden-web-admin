import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import StyledSelect from '@components/select-search/StyledSelect';
import { clusterController, locationController, regionController, subRegionController } from '@controllers';
import { Filter, Paging } from '@Core';
import { BaseHttpController } from '@Core/controller/BaseHttpController';
import { defaultPaging, reorder } from '@helpers';
import usePopUp from '@hooks/usePopUp';
import {
    ClusterWithRelations,
    Location,
    LocationWithRelations,
    CountryRegion,
    CountrySubRegion,
    CountrySubRegionWithRelations,
} from '@LocationOps/model';
import { ArrowDropDownRounded, CloseRounded, DragIndicatorRounded } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {
    Box,
    Breadcrumbs,
    Button,
    Collapse,
    Container,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import SelectOption from '@pages/rota-coverage/components/SelectOption';
import { theme } from '@theme';
import { omit, sample } from 'lodash';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useBoolean } from 'usehooks-ts';
import PopUpAddLocation from './PopUpAddLocation';
import PopUpWarning from './PopUpWarning';
import ReactGMap from './ReactGMap';

const BaseTitle = (props: { label: string; required?: boolean; length?: number; maxLength?: number }) => {
    return (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems="center">
            <Typography sx={{ fontWeight: 500, fontSize: 13 }}>
                {props.label} {props.required && <span style={{ color: 'red' }}>*</span>}
            </Typography>

            {props.maxLength && (
                <Typography sx={{ fontSize: 13 }}>
                    {props.length ?? 0}/{props.maxLength}
                </Typography>
            )}
        </Stack>
    );
};

const widths = {
    iconDrag: '5%',
    name: '22.5%',
    avg: '15%',
    dailyVisit: '15%',
    address: '38.5%',
    action: '5%',
};

export default function ClusterDetail() {
    const params = useParams<{ id: string }>();
    const [name, setName] = useState(' ');
    const [cluster, setCluster] = useState<ClusterWithRelations>({} as ClusterWithRelations);
    const navigate = useNavigate();

    const [state, setState] = useState<State>({
        location: defaultPaging(),
        region: defaultPaging(),
        subRegion: defaultPaging(),
    });

    const form = useForm<FormValues>({
        mode: 'all',
        defaultValues: {
            clusterName: '',
            locations: [],
            region: {},
            subRegion: {},
        },
    });

    const collapsedMap = useBoolean();

    const CountryRegionId = form.watch('region').Id;
    const CountrySubRegion = form.watch('subRegion');

    const { fields, append, remove, replace, update, swap, move } = useFieldArray({
        name: 'locations',
        control: form.control,
    });
    console.log(`fields`, fields);

    const popUpAddLocation = usePopUp();

    const hasMore = (field: keyof State) => {
        return state[field].page < state[field].totalPages;
    };

    function fetchMore<T>(
        controller: BaseHttpController<T>,
        field: keyof State,
        filter?: Filter<T> & { $or?: Filter<T> }
    ) {
        const { page, pageSize } = state[field];
        controller.list({ page: page + 1, pageSize, filter }).then((res) => {
            const _res = { ...res, rows: [...state[field].rows, ...res.rows] };
            setState((prev) => ({ ...prev, [field]: _res }));
        });
    }

    const fetchMoreRegion = async () => {
        fetchMore(regionController, 'region');
    };

    const fetchMoreSubRegion = async () => {
        fetchMore(subRegionController, 'subRegion', { CountryRegionId });
    };

    useEffect(() => {
        CountrySubRegion?.Id &&
            locationController
                .list({
                    pageSize: 50,
                    filter: { LocationType: 'mobile', CountrySubRegionId: CountrySubRegion.Id },
                })
                .then((res) => setState((p) => ({ ...p, location: res })));
    }, [CountrySubRegion]);

    useEffect(() => {
        CountryRegionId &&
            subRegionController
                .list({
                    pageSize: 50,
                    filter: { CountryRegionId: CountryRegionId },
                })
                .then((res) => setState((p) => ({ ...p, subRegion: res })));
    }, [CountryRegionId]);

    useEffect(() => {
        regionController.list({ pageSize: 50 }).then((res) => setState((p) => ({ ...p, region: res })));
    }, []);

    useEffect(() => {
        const isNew = params.id === 'new';
        if (!params.id || isNew) {
            setName('Create');
            return;
        }
        clusterController.get(params.id).then((res) => {
            console.log(`res`, res);
            setCluster(res);
            setName(res.Name);
            form.reset({
                clusterName: res.Name,
                region: res.CountrySubRegion?.CountryRegion,
                subRegion: res.CountrySubRegion,
                locations: res.Locations || [],
            });
        });
    }, [params.id]);

    function onDragEnd(result: DropResult, provided: ResponderProvided) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        move(result.source.index, result.destination.index);
    }

    const handleSave = (data: FormValues) => {
        const _cluster: ClusterWithRelations = {
            ...cluster,
            Name: data.clusterName,
            Locations: data.locations,
            CountrySubRegion: {
                ...data.subRegion,
                CountryRegion: data.region,
                CountryRegionId: data.region.Id!,
            },
            CountrySubRegionId: data.subRegion.Id,
        };

        clusterController.upsert(_cluster).then((res) => {
            toast.success('Save successfully!');
            navigate(`/setting/cluster`);
        });
    };

    const disabledSave = !form.formState.isDirty || !form.formState.isValid || !fields?.length;

    const popUpWarning = usePopUp();

    const [onSubmit, setOnSubmit] = useState<VoidFunction>(() => {});

    const handleChangeRegion = (option: CountryRegion) => {
        const f = () => {
            form.setValue('region', option!, {
                shouldTouch: true,
                shouldDirty: true,
                shouldValidate: true,
            });

            form.setValue('subRegion', {} as any);
            form.setValue('locations', []);
        };

        setOnSubmit(() => f);

        if (form.watch('locations').length) {
            popUpWarning.setTrue();
            return;
        }

        f();
    };

    const handleChangeSubRegion = (option: CountrySubRegion) => {
        const f = () => {
            form.setValue('subRegion', option!, {
                shouldTouch: true,
                shouldDirty: true,
                shouldValidate: true,
            });

            form.setValue('locations', []);
        };

        setOnSubmit(() => f);

        if (form.watch('locations').length) {
            popUpWarning.setTrue();
            return;
        }

        f();
    };
    const breadcrumbs: IBreadCrumbs[] = [
        { title: 'Manage' },
        { title: 'Cluster', href: '/setting/cluster' },
        { title: cluster.Name },
    ];

    return (
        <Container maxWidth={false} sx={{ py: 2, mb: 10 }}>
            <Stack direction={'row'} alignItems="center" justifyContent={'space-between'}>
                <Typography fontSize={24} sx={{ minHeight: 36 }}>
                    {name}
                </Typography>
            </Stack>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <Stack mt={3} spacing={3}>
                <Stack>
                    <BaseTitle
                        label="Cluster name"
                        required
                        length={form.watch('clusterName').length}
                        maxLength={200}
                    />

                    <TextField
                        {...form.register('clusterName', {
                            required: {
                                value: true,
                                message: 'Please enter the cluster name!',
                            },
                            maxLength: {
                                message: 'Maximum length is 200 characters!',
                                value: 200,
                            },
                        })}
                        fullWidth
                        placeholder="Enter cluster name"
                        size="small"
                        autoComplete="off"
                        error={!!form.formState.errors.clusterName?.message}
                        helperText={form.formState.errors.clusterName?.message}
                    />
                </Stack>

                <Stack direction={'row'} spacing={3}>
                    <Stack flex={1}>
                        <BaseTitle label="Region" required />
                        <StyledSelect
                            sx={{ width: '100%' }}
                            disabledSearch
                            isEqual={(option, value) => option.Id === value?.Id}
                            data={state.region.rows}
                            value={form.watch('region')}
                            hasMore={hasMore('region')}
                            next={fetchMoreRegion}
                            onChange={handleChangeRegion}
                            renderValue={(value) => {
                                return (
                                    <Typography noWrap>
                                        {value?.Name || `Select region (${state.region.total})`}
                                    </Typography>
                                );
                            }}
                            renderOption={(option) => <SelectOption isDisplay={false} option={option} />}
                        />
                    </Stack>

                    <Stack flex={1}>
                        <BaseTitle label="Sub-region" required />
                        <StyledSelect
                            sx={{ width: '100%' }}
                            isEqual={(option, value) => option.Id === value?.Id}
                            disabledSearch
                            disabled={!form.watch('region').Id}
                            data={state.subRegion.rows}
                            value={form.watch('subRegion')}
                            hasMore={hasMore('subRegion')}
                            next={fetchMoreSubRegion}
                            onChange={handleChangeSubRegion}
                            renderValue={(value) => {
                                return (
                                    <Typography noWrap>
                                        {value?.Name || `Select sub-region (${state.subRegion.total})`}
                                    </Typography>
                                );
                            }}
                            renderOption={(option) => <SelectOption isDisplay={false} option={option} />}
                        />
                    </Stack>
                </Stack>

                <Stack>
                    <Typography variant="h6">Mobile Locations</Typography>

                    {!!fields.length && (
                        <Table
                            aria-label="simple table"
                            sx={{ tableLayout: 'auto', borderCollapse: 'collapse', width: '100%' }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell width={widths.iconDrag}></TableCell>
                                    <TableCell width={widths.name}>Location name</TableCell>
                                    <TableCell width={widths.avg} align="right">
                                        Avg. Revenue
                                    </TableCell>
                                    <TableCell width={widths.dailyVisit} align="right">
                                        Daily visit
                                    </TableCell>
                                    <TableCell width={widths.address}>Address</TableCell>
                                    <TableCell width={widths.action}></TableCell>
                                </TableRow>
                            </TableHead>
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                                            {fields.map((item, index) => (
                                                <Draggable
                                                    key={item.Id}
                                                    draggableId={item.Id?.toString() || ''}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <TableRow
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            sx={{
                                                                ...provided.draggableProps.style,
                                                            }}
                                                        >
                                                            <TableCell width={widths.iconDrag}>
                                                                <DragIndicatorRounded
                                                                    color="disabled"
                                                                    fontSize="small"
                                                                />
                                                            </TableCell>
                                                            <TableCell width={widths.name}>{item.Name}</TableCell>
                                                            <TableCell align="right" width={widths.avg}>
                                                                {item.Revenue || 0}
                                                            </TableCell>
                                                            <TableCell align="right" width={widths.dailyVisit}>
                                                                {0}
                                                            </TableCell>
                                                            <TableCell width={widths.address}>{item.Address}</TableCell>
                                                            <TableCell width={widths.action}>
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    sx={{ padding: '3px' }}
                                                                    onClick={() => remove(index)}
                                                                >
                                                                    <CloseRounded sx={{ fontSize: '24px' }} />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Table>
                    )}

                    <Stack mt={2} direction={'row'} justifyContent={fields.length ? 'flex-end' : 'flex-start'}>
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={popUpAddLocation.setTrue}
                            disabled={!CountrySubRegion?.Id}
                        >
                            Add location +
                        </Button>
                    </Stack>

                    <Stack mt={2} sx={{ borderRadius: '10px', border: '1px solid #eee' }}>
                        <Collapse in={collapsedMap.value} collapsedSize="53px">
                            <Box mt={2} p={2} pt={0}>
                                <Stack
                                    flex={1}
                                    direction={'row'}
                                    alignItems="center"
                                    justifyContent={'space-between'}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => collapsedMap.toggle()}
                                >
                                    <Typography sx={{ fontWeight: 500 }}>Movement map</Typography>

                                    <IconButton sx={{ padding: 0 }}>
                                        <ArrowDropDownRounded
                                            sx={{
                                                transform: `rotate(${collapsedMap.value ? 0 : 180}deg)`,
                                                transition: '0.3s',
                                            }}
                                        />
                                    </IconButton>
                                </Stack>

                                <Stack mt={2}>
                                    <ReactGMap locations={fields} />
                                </Stack>
                            </Box>
                        </Collapse>
                    </Stack>
                </Stack>

                <Stack mt={3} direction="row" justifyContent={'space-between'}>
                    <Button variant="cancel" sx={{ minWidth: 150 }} onClick={() => navigate('/setting/cluster')}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        sx={{ minWidth: 150 }}
                        disabled={disabledSave}
                        onClick={form.handleSubmit(handleSave)}
                    >
                        Save
                    </Button>
                </Stack>

                <PopUpAddLocation
                    {...omit(popUpAddLocation, 'onConfirm')}
                    selectedLocations={fields}
                    subRegionId={CountrySubRegion?.Id}
                    onConfirm={(locations) => {
                        replace(locations);
                        popUpAddLocation.onClose();
                    }}
                />

                <PopUpWarning
                    {...popUpWarning}
                    onConfirm={() => {
                        console.log('onSubmit', onSubmit);
                        onSubmit();
                        popUpWarning.onClose();
                    }}
                />
            </Stack>
        </Container>
    );
}

type Props = {};

type State = {
    region: Paging<CountryRegion>;
    subRegion: Paging<CountrySubRegion>;
    location: Paging<LocationWithRelations>;
};

type FormValues = {
    clusterName: string;
    locations: Location[];
    region: CountryRegion;
    subRegion: Omit<CountrySubRegionWithRelations, 'Region' | 'Locations'>;
};
