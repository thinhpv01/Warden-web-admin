import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import IcSearch from '@components/icon/IcSearch';
import { clusterController } from '@controllers';
import { Paging } from '@Core';
import { defaultPaging } from '@helpers';
import useDebounceSearch from '@hooks/useDebounceSearch';
import { CustomGetListCluster } from '@LocationOps/controller/http/ClusterHttpController';
import { ClusterWithRelations } from '@LocationOps/model';
import {
    Box,
    Button,
    Container,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import BaseList from '../main/BaseList';
import EmptyPage from '../main/EmptyPage';
import ClusterCard from './RouteCard';

const breadcrumbs: IBreadCrumbs[] = [{ title: 'Manage' }, { title: 'Cluster' }];
export default function ClusterPage() {
    const theme = useTheme();
    const { t } = useTranslation();

    const [cluster, setCluster] = useState<Paging<ClusterWithRelations>>(defaultPaging());
    const [query, setQuery] = useState<CustomGetListCluster>({ page: 1, pageSize: 10, sorts: ['-Created'] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        clusterController
            .list(query)
            .then((res) => {
                setCluster(res);
            })
            .finally(() => setLoading(false));
    }, [query]);

    const handleDelete = (cluster: ClusterWithRelations) => {
        clusterController.delete(cluster.Id?.toString() || '').then((res) => {
            toast.success('Delete successfully!');
            clusterController.list({ pageSize: 10 }).then((res) => {
                setCluster(res);
            });
        });
    };

    const handleChangeSearch = (value: string) => {
        setQuery((p) => ({
            ...p,
            page: 1,
            search: {
                content: value,
                fields: ['Name'],
            },
        }));
    };

    const debSearch = useDebounceSearch({
        onSearch: handleChangeSearch,
    });

    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Stack direction={'row'} alignItems="center" justifyContent={'space-between'}>
                <Typography fontSize={24}>Cluster</Typography>
                <Link to="new" style={{ all: 'unset' }}>
                    <Button color="primary" variant="contained" sx={{ minWidth: 165 }}>
                        Add cluster +
                    </Button>
                </Link>
            </Stack>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <FormControl fullWidth variant="outlined" size="small" sx={{ mt: 2 }}>
                <InputLabel htmlFor="outlined-adornment" sx={{ color: '#DDDDDD' }}>
                    Search by name cluster
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
                    label="Search by name route"
                    sx={{ py: '1.5px' }}
                    value={debSearch.value}
                    onChange={(e) => debSearch.handleChange(e.target.value)}
                />
            </FormControl>

            <Box mt={2} mb={10}>
                <BaseList
                    count={cluster.totalPages}
                    page={cluster.page}
                    onChangePage={(page) => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        setQuery((p) => ({ ...p, page }));
                    }}
                    list={cluster.rows}
                    renderItem={(cluster) => <ClusterCard cluster={cluster} onDelete={handleDelete} />}
                    renderEmpty={() => <EmptyPage />}
                    loading={loading}
                />
            </Box>
        </Container>
    );
}
