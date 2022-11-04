import Coming from '@components/ComingSoon';
import AuthLayout from '@components/layouts/AuthLayout';
import Flag, { useFeatureFlag } from '@components/layouts/Flag';
import { FeatureName } from '@config';
import LieuLeaveApproval from '@pages/lieu-leave';
import Logout from '@pages/logout';
import Home from '@pages/rota-coverage';
import SettingPage from '@pages/setting';
import ThemePage from '@pages/ThemePage';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
    const routes: { index?: boolean; path?: string; element: JSX.Element; name?: FeatureName }[] = [
        {
            index: true,
            element: <Navigate to={'rota-coverage'} />,
            name: 'rota-coverage',
        },
        {
            path: 'rota-coverage/*',
            element: <Home />,
            name: 'rota-coverage',
        },
        {
            path: 'dashboard',
            element: <Coming />,
            name: 'dashboard',
        },
        {
            path: 'report',
            element: <Coming />,
            name: 'report',
        },
        {
            path: 'setting/*',
            element: <SettingPage />,
            name: 'setting',
        },
        {
            path: 'll-approvals/*',
            element: <LieuLeaveApproval />,
            name: 'lieu-leave',
        },
        {
            path: 'theme',
            element: <ThemePage />,
        },
        {
            path: 'logout',
            element: <Logout />,
        },
        {
            path: '*',
            element: <Navigate to={'rota-coverage'} />,
        },
    ];

    const { getActive } = useFeatureFlag();

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AuthLayout />}>
                    {/* <Route index element={<Navigate to={'rota-coverage'} />} />
                    <Route path="rota-coverage/*" element={<Home />} />
                    <Route path="dashboard" element={<Coming />} />
                    <Route path="report" element={<Coming />} />
                    <Route path="setting/*" element={<SettingPage />} />
                    <Route path="ll-approvals" element={<Coming />} />
                    <Route path="theme" element={<ThemePage />} /> */}
                    {/* <Route path="*" element={<Navigate to={'rota-coverage'} />} /> */}
                    {routes.map((r, index) => {
                        if (!r.name || getActive(r.name))
                            return <Route key={index} index={r.index} path={r.path} element={r.element} />;

                        return <></>;
                    })}
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
