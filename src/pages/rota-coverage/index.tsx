import Flag, { useFeatureFlag } from '@components/layouts/Flag';
import { appConfig, FeatureName } from '@config';
import { Navigate, Route, Routes } from 'react-router-dom';
import MobileRota from './mobile';
import StaticRota from './static';

type Props = {};

export default function Home({}: Props) {
    const routes: { index?: boolean; path?: string; element: JSX.Element; name?: FeatureName }[] = [
        {
            index: true,
            element: <Navigate to={'static'} />,
            name: 'rota-static',
        },
        {
            path: 'static',
            element: <StaticRota />,
            name: 'rota-static',
        },
        {
            path: 'mobile',
            element: <MobileRota />,
            name: 'rota-mobile',
        },
        {
            path: '*',
            element: <Navigate to={'/'} />,
        },
    ];
    const { getActive } = useFeatureFlag();

    return (
        <Routes>
            {/* <Route index element={<Navigate to={'static'} />} />
            <Route path="static" element={<StaticRota />} />
            <Route path="mobile" element={<MobileRota />} /> */}
            {routes.map((r, index) => {
                if (!r.name || getActive(r.name))
                    return <Route key={index} index={r.index} path={r.path} element={r.element} />;

                return <></>;
            })}
        </Routes>
    );
}
