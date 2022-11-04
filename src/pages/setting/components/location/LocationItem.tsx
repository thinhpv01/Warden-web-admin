import { CStack } from '@components/FlexedStack';
import IcChart from '@components/icon/IcChart';
import { Shift } from '@components/rota-table';
import usePopUp from '@hooks/usePopUp';
import { IconButton, Tooltip } from '@mui/material';
import React from 'react';
import PopupViewChart from './PopupViewChart';
type Props = {
    shifts: Shift[];
};
export default function LocationItem(props: Props) {
    const popupViewChart = usePopUp();

    return (
        <CStack sx={{ width: 80 }}>
            <Tooltip title={'Report working'} placement="top" arrow>
                <IconButton size="small" onClick={popupViewChart.setTrue}>
                    <IcChart style={{ width: 25, height: 25 }} />
                </IconButton>
            </Tooltip>
            <PopupViewChart {...popupViewChart} />
        </CStack>
    );
}
