import React, { useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

type Props = {
    onSearch(value: string): any;
};

export default function useDebounceSearch(props: Props) {
    const [value, setValue] = useState<string>('');
    const debouncedValue = useDebounce<string>(value, 300);

    const handleChange = (value: string) => {
        setValue(value);
    };

    // Fetch API (optional)
    useEffect(() => {
        props.onSearch(debouncedValue);
    }, [debouncedValue]);

    return {
        value,
        setValue,
        handleChange,
    };
}
