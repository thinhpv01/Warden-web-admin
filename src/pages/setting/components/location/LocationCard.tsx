import IcEdit from '@components/icon/IcEdit';
import { LocationWithRelations } from '@LocationOps/model';
import { Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';

type Props = {
    location: LocationWithRelations;
};
export default function LocationCard(props: Props) {
    const theme = useTheme();
    const { location } = props;
    return (
        <Box sx={{ width: '100%', p: 3, border: '1px solid #DDDDDD', borderRadius: 2 }}>
            <Stack width="100%" direction="row" alignItems="flex-start" justifyContent="space-between">
                <Stack gap={0.5}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        gap={2}
                        sx={{
                            '& > a': {
                                color: 'black',
                                textDecoration: 'none',
                            },
                        }}
                    >
                        <Link to={`${location.Id}`}>
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
                                {location.Name}
                            </Typography>
                        </Link>
                        {location.LocationType && (
                            <Box
                                sx={{
                                    width: 80,
                                    p: '4px 16px',
                                    background: location.LocationType === 'static' ? '#E8F5E9' : '#F09453',
                                    textAlign: 'center',
                                    borderRadius: 10,
                                    color: location.LocationType === 'static' ? theme.palette.primary.main : '#fff',
                                }}
                            >
                                {location.LocationType === 'static' ? 'Static' : 'Mobile'}
                            </Box>
                        )}
                    </Stack>
                    <Typography variant="body1" color={theme.palette.grey[500]} mt={1}>
                        Address: {location.Address}
                    </Typography>
                    <Typography variant="body1" color={theme.palette.grey[500]}>
                        Region: {location.CountrySubRegion?.CountryRegion?.Name} | Sub-region:{' '}
                        {location.CountrySubRegion?.Name} | Location ID: {location.Id}
                    </Typography>
                    <Typography fontSize={14} color="secondary">
                        Revenue: £{location.Revenue ?? 0}
                    </Typography>
                </Stack>
                <Link to={`${location.Id}`}>
                    <Tooltip title="Edit" placement="top" arrow>
                        <Stack
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                width: 30,
                                height: 30,
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
                            <IcEdit />
                        </Stack>
                    </Tooltip>
                </Link>
            </Stack>
        </Box>
    );
}
