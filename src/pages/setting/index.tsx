import Flag, { useFeatureFlag } from '@components/layouts/Flag';
import { FeatureName } from '@config';
import { Navigate, Route, Routes } from 'react-router-dom';
import ClusterPage from './components/cluster';
import ClusterDetail from './components/cluster/ClusterDetail';
import LocationBase from './components/location';
import LocationDetails from './components/location/LocationDetails';
import WardenBase from './components/warden';
import CalendarAndSchedule from './components/warden/components/CalendarAndSchedule';
import LieudaySchedule from './components/warden/components/LieudaySchedule';
import PersonalInformation from './components/warden/components/PersonalInformation';
import SendMail from './components/warden/components/SendMail';
import WardenDetails from './components/warden/WardenDetails';
type RouteItem = {
    path: string;
    element: JSX.Element;
};
export default function SettingPage() {
    const routes: {
        index?: boolean;
        path?: string;
        children?: RouteItem[];
        element: JSX.Element;
        name?: FeatureName;
    }[] = [
        {
            index: true,
            element: <Navigate to={'warden'} />,
            name: 'setting-warden',
        },
        {
            path: 'warden',
            element: <WardenBase />,
            name: 'setting-warden',
        },
        {
            path: 'warden/:id',
            element: <WardenDetails />,
            name: 'setting-warden',
            children: [
                {
                    path: 'details',
                    element: <PersonalInformation />,
                },
                {
                    path: 'calendar-schedule',
                    element: <CalendarAndSchedule />,
                },
                {
                    path: 'send-email',
                    element: <SendMail />,
                },
                // {
                //     path: 'lieu-day',
                //     element: <LieudaySchedule />,
                // },
            ],
        },
        {
            path: 'location',
            element: <LocationBase />,
            name: 'setting-location',
        },
        {
            path: 'location/:id',
            element: <LocationDetails />,
            name: 'setting-location',
        },
        {
            path: 'cluster',
            element: <ClusterPage />,
            name: 'setting-cluster',
        },
        {
            path: 'cluster/new',
            element: <ClusterDetail />,
            name: 'setting-cluster',
        },
        {
            path: 'cluster/:id',
            element: <ClusterDetail />,
            name: 'setting-cluster',
        },
        {
            path: '*',
            element: <Navigate to={'/'} />,
        },
    ];

    const { getActive } = useFeatureFlag();

    return (
        <Routes>
            {/* <Route path="/" element={<Navigate to={'warden'} />} />
            <Route path="warden" element={<WardenBase />} />
            <Route path="warden/:id" element={<WardenDetails />}>
                <Route path="details" element={<PersonalInformation />} />
                <Route path="calendar-schedule" element={<CalendarAndSchedule />} />
                <Route path="send-email" element={<SendMail />} />
                <Route path="lieu-day" element={<LieudaySchedule />} />
            </Route>
            <Route path="location" element={<LocationBase />} />
            <Route path="location/:id" element={<LocationDetails />} />
            <Route path="cluster" element={<ClusterPage />} />
            <Route path="cluster/new" element={<ClusterDetail />} />
            <Route path="cluster/:id" element={<ClusterDetail />} /> */}
            {/* {routes.map((r) => {
                if (!r.name) return r.element;
                return (
                    <Flag name={r.name}>
                        <Route index={r.index} path={r.path} element={r.element}>
                            
                        </Route>
                    </Flag>
                );
            })} */}

            {routes.map((r, index) => {
                if (!r.name || getActive(r.name)) {
                    return (
                        <Route key={index} index={r.index} path={r.path} element={r.element}>
                            {r.children?.map((rc) => {
                                return <Route key={rc.path} path={rc.path} element={rc.element} />;
                            })}
                        </Route>
                    );
                }

                return <></>;
            })}
        </Routes>
    );
}
