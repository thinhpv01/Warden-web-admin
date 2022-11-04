import BreadCrumbs, { IBreadCrumbs } from '@components/BreadCrumbs';
import { wardenController } from '@controllers';
import { Container, Stack, SxProps, TableCell, TableCellProps, Theme, Typography, useTheme } from '@mui/material';
import { Warden } from '@WardenOps/model';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineMail } from 'react-icons/hi';
import { IoCalendarOutline } from 'react-icons/io5';
import { TiUser } from 'react-icons/ti';
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';

export const BaseHead = ({
    title,
    sx,
    align,
}: {
    title: string | any;
    sx?: SxProps<Theme>;
    align?: TableCellProps['align'];
}) => {
    return (
        <TableCell sx={sx} align={align ?? 'right'}>
            <Typography variant="h6">{title}</Typography>
        </TableCell>
    );
};

export const RowInformation = ({ title, content }: { title: string; content: any }) => {
    return (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="body1">{title}:</Typography>
            <Typography variant="body1">{content}</Typography>
        </Stack>
    );
};

export default function WardenDetails() {
    const params = useParams<{ id: string }>();
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isSelected, setIsSelected] = useState(-1);
    const [warden, setWarden] = useState<Warden>({} as Warden);

    useEffect(() => {
        if (location.pathname.includes('/details')) {
            setIsSelected(0);
        } else if (location.pathname.includes('/calendar-schedule')) {
            setIsSelected(1);
        } else if (location.pathname.includes('/send-email')) {
            setIsSelected(2);
        }
        // else if (location.pathname.includes('/lieu-day')) {
        //     setIsSelected(3);
        // }
        const init = async () => {
            if (!params.id) return;
            const res = await wardenController.get(params.id);
            setWarden(res);
        };
        init();
    }, [location, params.id]);

    const tabs = [
        {
            id: 1,
            title: t('wardenDetailsPage.title.personalInfo'),
            icon: <TiUser fontSize={18} />,
            path: 'details',
        },
        {
            id: 2,
            title: t('wardenDetailsPage.title.calendarAndSchedule'),
            icon: <IoCalendarOutline fontSize={18} />,
            path: 'calendar-schedule',
        },
        {
            id: 3,
            title: t('wardenDetailsPage.title.sendEmail'),
            icon: <HiOutlineMail fontSize={18} />,
            path: 'send-email',
        },
        // {
        //     id: 4,
        //     title: 'Lieu day',
        //     icon: <HiOutlineMail fontSize={18} />,
        //     path: 'lieu-day',
        // },
    ];
    const breadcrumbs: IBreadCrumbs[] = [
        { title: 'Manage' },
        { title: 'Warden', href: '/setting/warden' },
        { title: warden.FullName ?? '' },
    ];

    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Typography fontSize={24}>Warden: {warden.FullName}</Typography>
            <BreadCrumbs breadcrumbs={breadcrumbs} />
            <Stack direction="row" gap={1} mt={5}>
                {tabs.map((item, index) => {
                    return (
                        <Stack
                            key={index + 'z'}
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                width: 200,
                                p: 1,
                                background: isSelected === index ? '#E8F5E9' : '#FAFAFA',
                                borderRadius: '8px 8px 0px 0px',
                                color: isSelected === index ? theme.palette.primary.main : 'inherit',
                                cursor: 'pointer',
                                transition: '.2s',
                            }}
                            gap={1}
                            onClick={() => {
                                navigate(`${item.path}`);
                            }}
                        >
                            {item.icon}
                            <Typography
                                variant="body1"
                                color={isSelected === index ? theme.palette.primary.main : 'inherit'}
                            >
                                {item.title}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
            <Outlet context={{ warden, setWarden }} />
        </Container>
    );
}
type ContextType = { warden: Warden; setWarden: Dispatch<SetStateAction<Warden>> };
export function useWarden() {
    return useOutletContext<ContextType>();
}
