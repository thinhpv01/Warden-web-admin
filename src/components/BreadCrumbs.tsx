import { Breadcrumbs, Link, useTheme } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import React from 'react';
export type IBreadCrumbs = {
    title: string;
    href?: string;
};
type Props = {
    breadcrumbs: IBreadCrumbs[];
};
export default function BreadCrumbs({ breadcrumbs }: Props) {
    const theme = useTheme();
    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            color={theme.palette.secondary.main}
        >
            {breadcrumbs.map((bc, index) => {
                return (
                    <Link underline={bc.href ? 'hover' : 'none'} key={index} color="inherit" href={bc.href || '#'}>
                        {bc.title}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
}
