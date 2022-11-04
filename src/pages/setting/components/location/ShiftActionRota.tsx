import IcEdit from '@components/icon/IcEdit';
import { Shift, ShiftStatus } from '@components/rota-table';
import { IconButton } from '@mui/material';

type Props<T extends Shift> = {
    shift: T;
    onEdit?(shift: T): void;
};

export default function ShiftActionRota<T extends Shift>(props: Props<T>) {
    return (
        <>
            {props.shift.status && (
                <IconButton size="small" onClick={() => props.onEdit?.(props.shift)}>
                    <IcEdit />
                </IconButton>
            )}
        </>
    );
}
