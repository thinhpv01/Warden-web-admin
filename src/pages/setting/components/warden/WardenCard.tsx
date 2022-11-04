import IcCalendar from '@components/icon/IcCalendar';
import IcEmail from '@components/icon/IcEmail';
import IcWarden from '@components/icon/navbar/IcWarden';
import { formatDate } from '@helpers';
import { Avatar, Box, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { WardenWithRelations } from '@WardenOps/model';
import { useTranslation } from 'react-i18next';
import { TiUser } from 'react-icons/ti';
import { Link } from 'react-router-dom';

const IconBase = ({
    title,
    colorHover,
    children,
}: {
    title: string;
    colorHover: string;
    children: React.ReactElement;
}) => {
    return (
        <Tooltip title={title} placement="top" arrow>
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
                    '&:hover, &:hover .svgCalendar, &:hover .svgEmail': {
                        stroke: colorHover,
                        color: colorHover,
                    },
                }}
            >
                {children}
            </Stack>
        </Tooltip>
    );
};
type Props = {
    warden: WardenWithRelations;
};
export default function WardenCard({ warden }: Props) {
    const theme = useTheme();
    const { t } = useTranslation();
    return (
        <Box sx={{ width: '100%', p: 3, border: '1px solid #DDDDDD', borderRadius: 2 }}>
            <Stack width="100%" direction="row" alignItems="flex-start" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={1}>
                    <Avatar src={warden.Picture} alt="" sx={{ width: 60, height: 60, border: '4px solid #DDDDDD' }} />
                    <Stack
                        gap={1}
                        sx={{
                            '& > a': {
                                color: 'black',
                                textDecoration: 'none',
                            },
                        }}
                    >
                        <Link to={`${warden.Id}/details`}>
                            <Typography
                                variant="h5"
                                fontWeight={500}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: theme.palette.secondary.main,
                                        textDecoration: 'underline',
                                    },
                                    transition: '.3s',
                                }}
                            >
                                {warden.FullName} - No. {warden.Id}
                            </Typography>
                        </Link>
                        <Typography variant="body1" color={theme.palette.grey[500]}>
                            {t('wardenPage.text.phone')}: {warden.PhoneNumber}{' '}
                            <Typography component="span" variant="body1" color={theme.palette.grey[500]} pl={1}>
                                {t('wardenPage.text.email')}: {warden.Email}
                            </Typography>
                        </Typography>
                        <Typography>
                            {t('wardenPage.text.allocated')}: {warden.Allocated ?? 0} {t('wardenPage.text.locations')} |{' '}
                            {t('wardenPage.text.startDate')}: {formatDate(warden.StartDate ?? new Date())} |{' '}
                            {t('wardenPage.text.contractedHours')}: {warden.ContractHours}h
                        </Typography>
                    </Stack>
                </Stack>
                <Stack direction="row" gap={1}>
                    <Link to={`${warden.Id}/details`}>
                        <IconBase
                            title="View details"
                            colorHover={theme.palette.primary.main}
                            children={<IcWarden />}
                        />
                    </Link>
                    <Link to={`${warden.Id}/calendar-schedule`}>
                        <IconBase title="Rota" colorHover="#F09453" children={<IcCalendar fontSize={18} />} />
                    </Link>
                    <Link to={`${warden.Id}/send-email`}>
                        <IconBase
                            title="Send email"
                            colorHover={theme.palette.secondary.main}
                            children={<IcEmail fontSize={18} />}
                        />
                    </Link>
                </Stack>
            </Stack>
        </Box>
    );
}
