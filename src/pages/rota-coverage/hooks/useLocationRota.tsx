import { RotaCoverageRaw } from '@LocationOps/model';
import React, { useState } from 'react';

type Props = {};

export default function useLocationRota({}: Props) {
    const [rotaLocationRaw, setRotaLocationRaw] = useState<RotaCoverageRaw>({ Periods: [], Rotas: [] });

    return <div>useLocationRota</div>;
}
