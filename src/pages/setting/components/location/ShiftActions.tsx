import IcEdit from '@components/icon/IcEdit';
import { Shift, ShiftStatus } from '@components/rota-table';
import { IconButton } from '@mui/material';

type Props = {
    shift: Shift;
    onEdit?(shift: Shift): void;
};

const ShiftActions = (props: Props) => {
    return (
        <>
            {props.shift.status && [ShiftStatus.notFull].includes(props.shift.status) && (
                <IconButton size="small" onClick={() => props.onEdit?.(props.shift)}>
                    <IcEdit />
                </IconButton>
            )}
        </>
    );
};

export default ShiftActions;
