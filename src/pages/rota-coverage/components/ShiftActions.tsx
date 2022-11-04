import IcAddWarden from '@components/icon/IcAddWarden';
import IcEdit from '@components/icon/IcEdit';
import { ShiftStatus } from '@components/rota-table';
import { IconButton } from '@mui/material';
import { ShiftRota } from '../hooks/useRota';

type Props<T> = {
    shift: T;
    // onSubmit?(): void;
    onEdit?(shift: T): void;
    onAddWarden?(shift: T): void;
};

function ShiftActions<T extends ShiftRota>(props: Props<T>) {
    return (
        <>
            {props.shift.status &&
                (props.shift.missing || 0) < (props.shift.requiredWarden || 0) &&
                [ShiftStatus.full, ShiftStatus.notFull].includes(props.shift.status) && (
                    <IconButton size="small" onClick={() => props.onEdit?.(props.shift)}>
                        <IcEdit />
                    </IconButton>
                )}
            {props.shift.status && (
                <IconButton size="small" onClick={() => props.onAddWarden?.(props.shift)}>
                    <IcAddWarden />
                </IconButton>
            )}
        </>
    );
}

export default ShiftActions;
