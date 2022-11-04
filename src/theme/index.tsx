import { createTheme } from '@mui/material';
import color from './color';

declare module '@mui/material/Button' {
    interface ButtonPropsVariantOverrides {
        errorContained: true;
        errorOutlined: true;
        cancel: true;
        cancelSmall: true;
    }
}

export const pxToRem = (value: number) => {
    return `${value / 16}rem`;
};

export const theme = createTheme({
    shape: {
        borderRadius: 5,
    },
    palette: {
        primary: {
            main: color.primary,
            light: color.lightPrimary,
        },
        secondary: {
            main: color.secondary,
            // contrastText: color.textPrimary,
        },
        warning: {
            main: color.warning,
        },
        success: {
            main: color.success,
        },
        error: {
            main: color.danger,
            light: '#FFF4F5',
        },
    },
    typography: {
        fontSize: 14,
        fontFamily: 'TT Firs Neue',
        allVariants: {
            fontWeight: 400,
            fontStyle: 'normal',
        },
        button: {
            textTransform: 'capitalize',
        },
        body1: {
            fontSize: '0.875rem',
            // [breakpoints.down("sm")]: {
            // 	fontSize: pxToRem(12),
            // },
        },
        body2: {
            fontSize: '0.75rem',
            // [breakpoints.down("sm")]: {
            // 	fontSize: pxToRem(12),
            // },
        },
        h6: {
            fontSize: '0.875rem',
            fontWeight: 500,
            // [breakpoints.down("sm")]: {
            // 	fontSize: pxToRem(12),
            // },
        },
        h5: {
            fontSize: '1rem',
            fontWeight: 500,
            // [breakpoints.down("sm")]: {
            // 	fontSize: pxToRem(14),
            // },
        },
        h4: {
            fontSize: '1.25rem',
            fontWeight: 500,
            // [breakpoints.down("sm")]: {
            // 	fontSize: "1rem",
            // },
        },
        h3: {
            fontSize: '1.5rem',
            fontWeight: 500,
            // [breakpoints.down("sm")]: {
            // 	fontSize: "1,25rem",
            // },
        },
        h2: {
            fontSize: '2rem',
            fontWeight: 500,
            color: color.textPrimary,
            // [breakpoints.down("sm")]: {
            // 	fontSize: "1.5rem",
            // },
        },
        h1: {
            fontSize: '2.5rem',
            fontWeight: 500,
            // [breakpoints.down("sm")]: {
            // 	fontSize: "2rem",
            // },
        },
        subtitle1: {
            fontSize: '0.75rem',
            color: '#333333',
            // [breakpoints.down("sm")]: {
            // 	fontSize: "1.125rem",
            // },
        },
        subtitle2: {
            fontSize: '0.625rem',
            color: '#333333',
            // [breakpoints.down("sm")]: {
            // 	fontSize: "1.125rem",
            // },
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1rem',
                    height: 'fit-content',
                    boxShadow: 'none !important',
                    '&:hover  .MuiSvgIcon-root': {
                        padding: '0.125rem',
                        fontSize: '2rem',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: color.grey300,
                        borderColor: color.grey300,
                        color: '#A6A6A6',
                    },
                },
                containedPrimary: {
                    padding: '0.6875rem 1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1rem',
                    boxShadow: 'none',
                    backgroundColor: color.primary,
                    color: color.white,
                    borderWidth: 1,
                    borderStyle: 'solid',
                    borderColor: color.primary,
                    '&:hover': {
                        boxShadow: 'none',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        backgroundColor: color.darkPrimary,
                    },
                },
                outlined: {
                    padding: '0.6875rem 1rem',
                    backgroundColor: color.white,
                },
                text: {},
                sizeSmall: {
                    fontSize: '0.75rem',
                    lineHeight: '1.25rem',
                    padding: '0.25rem 1rem',
                },
            },
            variants: [
                {
                    props: { variant: 'errorContained' },
                    style: {
                        padding: '0.6875rem 1rem',
                        backgroundColor: color.danger,
                        color: color.white,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        '&:hover': {
                            backgroundColor: color.darkDanger,
                        },
                    },
                },
                {
                    props: { variant: 'errorOutlined' },
                    style: {
                        padding: '0.6875rem 1rem',
                        backgroundColor: color.white,
                        color: color.danger,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        '&:hover': {
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: color.darkDanger,
                            backgroundColor: color.white,
                        },
                    },
                },
                {
                    props: { variant: 'cancel' },
                    style: {
                        padding: '0.6875rem 1rem',
                        fontSize: '0.875rem',
                        lineHeight: '1rem',
                        backgroundColor: color.grey300,
                        color: '#4F4F4F',
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: '#C5C5C5',
                        '&:hover': {
                            backgroundColor: color.grey400,
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#F3F3F3',
                            borderColor: '#F3F3F3',
                            color: '#A6A6A6',
                        },
                    },
                },
                {
                    props: { variant: 'cancelSmall' },
                    style: {
                        padding: '0.25rem 1rem',
                        fontSize: '0.75rem',
                        lineHeight: '1rem',
                        backgroundColor: color.grey300,
                        color: color.textPrimary,
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: color.grey300,
                        '&:hover': {
                            backgroundColor: color.grey400,
                        },
                        '&.Mui-disabled': {
                            backgroundColor: '#F3F3F3',
                            borderColor: '#F3F3F3',
                            color: '#A6A6A6',
                        },
                    },
                },
            ],
        },
    },
});
