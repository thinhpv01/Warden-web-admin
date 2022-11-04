import { useMsal } from '@azure/msal-react';
import IcDashboard from '@components/icon/navbar/IcDashboard';
import IcLieu from '@components/icon/navbar/IcLieu';
import IcLocation from '@components/icon/navbar/IcLocation';
import IcMobileRota from '@components/icon/navbar/IcMobileRota';
import IcReport from '@components/icon/navbar/IcReport';
import IcRota from '@components/icon/navbar/IcRota';
import IcRoute from '@components/icon/navbar/IcRoute';
import IcStaticRota from '@components/icon/navbar/IcStaticRota';
import IcWarden from '@components/icon/navbar/IcWarden';
import { appConfig, FeatureName } from '@config';
import { AZURE_ID } from '@helpers';
import { ArrowDropDownRounded, Dashboard, LogoutRounded, StarBorder } from '@mui/icons-material';
import {
    Box,
    Collapse,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    styled,
    Toolbar,
} from '@mui/material';
import { ReactElement, useEffect, useState } from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import Flag from './Flag';

const drawerWidth = 240;

const SListItemButton = styled(ListItemButton)(({ theme }) => ({
    borderRadius: 7,
    padding: '8px 12px',
    '&.MuiButtonBase-root.MuiListItemButton-root.Mui-selected': {
        backgroundColor: 'rgba(52, 121, 187, 0.1)',
    },
}));
const SListItemIcon = styled(ListItemIcon)({
    minWidth: 'unset',
    marginRight: 12,
});

interface INav {
    icon?: ReactElement;
    title: string;
    path: string;
    children?: INav[];
    defaultOpen?: boolean;
    name: FeatureName;
}

const ChildItem = ({ item }: { item: INav }) => {
    let resolved = useResolvedPath(item.path);
    console.log(`ChildItem resolved`, resolved);
    const match = useMatch({ path: resolved.pathname });
    console.log(`ChildItem match`, match);

    return (
        <Link to={item.path} replace style={{ all: 'unset' }}>
            <SListItemButton
                sx={{
                    pl: 4,
                    '& *': { color: !!match ? '#3479BB' : undefined },
                    '&.MuiButtonBase-root.MuiListItemButton-root.Mui-selected': {
                        bgcolor: '#fff !important',
                    },
                }}
                key={item.path}
                selected={!!match}
            >
                <SListItemIcon>{item.icon || <StarBorder />}</SListItemIcon>
                <ListItemText primary={item.title} />
            </SListItemButton>
        </Link>
    );
};

const StyledListItem = (props: { item: INav }) => {
    const { item } = props;
    let resolved = useResolvedPath(item.path);
    const match = useMatch({ path: resolved.pathname, end: false });

    const [open, setOpen] = useState(props.item.defaultOpen ?? !!match);

    const handleClick = () => {
        setOpen(!open);
    };

    useEffect(() => {
        if (!match) {
            setOpen(false);
        }
    }, [match]);

    useEffect(() => {
        if (props.item.defaultOpen) {
            setOpen(props.item.defaultOpen);
        }
    }, [props.item.defaultOpen]);

    const to = item.children ? item.path + item.children[0].path : item.path;

    return (
        <>
            <Link to={to} style={{ all: 'unset' }}>
                <ListItem disablePadding>
                    <SListItemButton
                        sx={{ '& *': { color: !!match ? '#3479BB' : undefined } }}
                        selected={!!match}
                        onClick={handleClick}
                    >
                        <SListItemIcon>{item.icon || <Dashboard />}</SListItemIcon>
                        <ListItemText primary={item.title} />
                        {item.children && (
                            <ArrowDropDownRounded
                                fontSize="small"
                                sx={{
                                    transform: `rotate(${open ? 0 : 180}deg)`,
                                    transition: '0.3s',
                                }}
                            />
                        )}
                    </SListItemButton>
                </ListItem>
            </Link>

            {item.children && (
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {item.children.map((c: INav) => {
                            return (
                                <Flag key={c.path} name={c.name}>
                                    <ChildItem key={c.path} item={{ ...c, path: item.path.slice(1) + c.path }} />
                                </Flag>
                            );
                        })}
                    </List>
                </Collapse>
            )}
        </>
    );
};

export default function NavBar() {
    const { instance, accounts } = useMsal();

    const handleLogout = () => {
        instance
            .logoutRedirect({
                postLogoutRedirectUri: '/',
            })
            .then((res) => {
                sessionStorage.removeItem(AZURE_ID);
            });
    };

    const routes: INav[] = [
        {
            icon: <IcRota />,
            title: 'Rota coverage',
            path: '/rota-coverage',
            children: [
                {
                    icon: <IcStaticRota />,
                    title: 'Static',
                    path: '/static',
                    name: 'rota-static',
                },
                {
                    icon: <IcMobileRota />,
                    title: 'Mobile',
                    path: '/mobile',
                    name: 'rota-mobile',
                },
            ],
            defaultOpen: true,
            name: 'rota-coverage',
        },
        {
            icon: <IcDashboard />,
            title: 'Dashboard',
            path: '/dashboard',
            name: 'dashboard',
        },
        { icon: <IcReport />, title: 'Report', path: '/report', name: 'report' },
        {
            icon: <IcMobileRota />,
            title: 'Setting',
            path: '/setting',
            name: 'setting',
            children: [
                {
                    icon: <IcWarden />,
                    title: 'Warden',
                    path: '/warden',
                    name: 'setting-warden',
                },
                {
                    icon: <IcLocation />,
                    title: 'Location',
                    path: '/location',
                    name: 'setting-location',
                },
                {
                    icon: <IcRoute />,
                    title: 'Cluster',
                    path: '/cluster',
                    name: 'setting-cluster',
                },
            ],
        },
        {
            icon: <IcLieu />,
            title: 'Lieu/Leave approvals',
            path: '/ll-approvals',
            name: 'lieu-leave',
        },
    ];

    return (
        <Drawer
            open
            variant="permanent"
            ModalProps={{
                keepMounted: true,
            }}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar />
            <Stack justifyContent={'space-between'} sx={{ overflow: 'auto', height: '100%' }}>
                <Stack direction="row" height="100%" mt={5}>
                    <List sx={{ px: 1, width: '100%' }}>
                        {routes.map((item, index) => {
                            return (
                                <Flag key={index} name={item.name}>
                                    <StyledListItem item={item} />
                                </Flag>
                            );
                        })}
                    </List>
                </Stack>
                {/* <Divider />
				<List>
					{["All mail", "Trash", "Spam"].map((text, index) => (
						<ListItem key={text} disablePadding>
							<ListItemButton>
								<SListItemIcon>
									{index % 2 === 0 ? <Inbox /> : <Mail />}
								</SListItemIcon>
								<ListItemText primary={text} />
							</ListItemButton>
						</ListItem>
					))}
				</List> */}

                <Box pb={10} px={1}>
                    <SListItemButton sx={{ bgcolor: '#eee' }} onClick={handleLogout}>
                        <SListItemIcon>
                            <LogoutRounded color="error" sx={{ fontSize: '18px' }} />
                        </SListItemIcon>
                        <ListItemText
                            sx={{
                                '& > *': {
                                    color: 'gray',
                                },
                            }}
                            primary={'Sign out'}
                        />
                    </SListItemButton>
                </Box>
            </Stack>
        </Drawer>
    );
}
