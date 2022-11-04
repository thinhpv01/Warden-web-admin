import { Container, Stack, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IoCalendarOutline } from 'react-icons/io5';
import { TiUser } from 'react-icons/ti';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function LieuBase() {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [isSelected, setIsSelected] = useState(-1);

    useEffect(() => {
        if (location.pathname.includes('/news')) {
            setIsSelected(0);
        } else if (location.pathname.includes('/history')) {
            setIsSelected(1);
        }
    }, [location]);

    const tabs = [
        {
            id: 1,
            title: 'New request',
            icon: <TiUser fontSize={18} />,
            path: 'news',
        },
        {
            id: 2,
            title: 'Approval history',
            icon: <IoCalendarOutline fontSize={18} />,
            path: 'history',
        },
    ];

    return (
        <Container maxWidth={false} sx={{ py: 2 }}>
            <Typography fontSize={24}>Lieu/Leave approvals</Typography>
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
            <Outlet />
        </Container>
    );
}
