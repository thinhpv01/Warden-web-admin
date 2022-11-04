import { useFeatureFlag } from '@components/layouts/Flag';
import { FeatureName } from '@config';
import { Navigate, Route, Routes } from 'react-router-dom';
import ApprovalHistory from './components/ApprovalHistory';
import LieuBase from './components/LieuBase';
import NewRequest from './components/NewRequest';
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
            element: <Navigate to={'warden/news'} />,
        },
        {
            path: 'warden',
            element: <LieuBase />,
            name: 'lieu-leave',
            children: [
                {
                    path: 'news',
                    element: <NewRequest />,
                },
                {
                    path: 'history',
                    element: <ApprovalHistory />,
                },
            ],
        },
        {
            path: '*',
            element: <Navigate to={'/'} />,
        },
    ];

    const { getActive } = useFeatureFlag();

    return (
        <Routes>
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
