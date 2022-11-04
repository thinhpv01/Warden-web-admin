import { CStack } from '@components/FlexedStack';
import IcRoute from '@components/icon/navbar/IcRoute';
import usePopUp from '@hooks/usePopUp';
import { ClusterWithRelations } from '@LocationOps/model';
import { IconButton } from '@mui/material';
import { ShiftRota } from '../../hooks/useRota';
import PopUpViewDetail from './PopUpViewDetail';

export type MobileRotaItemProps = {
    shifts: ShiftRota[];
    cluster: ClusterWithRelations;
    date: Date;
};

export default function MobileRotaItem(props: MobileRotaItemProps) {
    const popUpViewDetail = usePopUp();
    return (
        <CStack sx={{ width: 80 }}>
            <IconButton size="small" onClick={popUpViewDetail.setTrue}>
                <IcRoute style={{ width: 25, height: 25 }} />
            </IconButton>

            <PopUpViewDetail {...popUpViewDetail} {...props} />
        </CStack>
    );
}
