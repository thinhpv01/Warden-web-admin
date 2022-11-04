import IcEdit from '@components/icon/IcEdit';
import IcRemove from '@components/icon/IcRemove';
import PopUpWarning from '@components/PopUpWarning';
import usePopUp from '@hooks/usePopUp';
import { Cluster, ClusterWithRelations } from '@LocationOps/model';
import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
// import { Location } from '../location/LocationCard';
type TypeLocation = 'static' | 'mobile';
export interface Location {
    id: string;
    name: string;
    address: string;
    region: string;
    subRegion: string;
    revenue: number;
    type: TypeLocation;
}
type Props = {
    cluster: ClusterWithRelations;
    onDelete?(cluster: ClusterWithRelations): void;
};

export default function ClusterCard(props: Props) {
    const { cluster } = props;
    const theme = useTheme();
    const popUpWarning = usePopUp();

    return (
        <Box sx={{ width: '100%', p: 3, border: '1px solid #DDDDDD', borderRadius: 2 }}>
            <Stack width="100%" direction="row" alignItems="flex-start" justifyContent="space-between">
                <Stack gap={0.5}>
                    <Link to={cluster.Id?.toString() ?? '#'} style={{ all: 'unset' }}>
                        <Typography
                            variant="body1"
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    color: theme.palette.primary.main,
                                    textDecoration: 'underline',
                                },
                                transition: '.5s',
                            }}
                        >
                            {cluster.Name}
                        </Typography>
                    </Link>
                    <Typography color="GrayText">
                        Location ({cluster.Locations?.length}): {cluster.Locations?.map((l) => l.Name).join(', ')}
                    </Typography>
                </Stack>

                <Stack direction={'row'} spacing={1}>
                    <Link to={`${cluster.Id}`}>
                        <Tooltip title="Edit" arrow placement="top">
                            <Stack
                                alignItems="center"
                                justifyContent="center"
                                sx={{
                                    border: '4px solid #FAFAFA',
                                    width: 32,
                                    height: 32,
                                    background: '#DDDDDD',
                                    borderRadius: 5,
                                    cursor: 'pointer',
                                    color: '#85858A',
                                    transition: '.5s',
                                    '&:hover': {
                                        color: theme.palette.secondary.main,
                                    },
                                }}
                            >
                                <IcEdit width={14} height={14} />
                            </Stack>
                        </Tooltip>
                    </Link>

                    <Tooltip title="Delete" arrow placement="top">
                        <Stack
                            onClick={() => popUpWarning.setTrue()}
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                width: 32,
                                height: 32,
                                border: '4px solid #FAFAFA',
                                background: '#DDDDDD',
                                borderRadius: 5,
                                cursor: 'pointer',
                                color: '#85858A',
                                transition: '.5s',
                                '&:hover': {
                                    color: theme.palette.error.main,
                                },
                            }}
                        >
                            <IcRemove width={14} height={14} />
                        </Stack>
                    </Tooltip>
                </Stack>
            </Stack>

            <PopUpWarning
                {...popUpWarning}
                title="Confirm"
                onConfirm={() => {
                    props.onDelete?.(props.cluster);
                    popUpWarning.onClose();
                }}
            />
        </Box>
    );
}
