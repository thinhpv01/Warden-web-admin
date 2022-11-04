import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { Loading } from '@components/layouts/Loading';
import i18n from '@i18n/config';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LoadScript } from '@react-google-maps/api';
import { theme } from '@theme';
import ReactDOM from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { appConfig, msalConfig } from './config';
import './index.css';
import reportWebVitals from './reportWebVitals';
import momentTimeZone from 'moment-timezone';
momentTimeZone.tz.setDefault('UTC');

export const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <ThemeProvider theme={theme}>
        <MsalProvider instance={msalInstance}>
            <LocalizationProvider dateAdapter={AdapterMoment}>
                <I18nextProvider i18n={i18n}>
                    <LoadScript googleMapsApiKey={appConfig.googleMapApiKey} loadingElement={<Loading />}>
                        <CssBaseline />
                        <App />
                        <ToastContainer autoClose={2000} position={'bottom-left'} newestOnTop />
                    </LoadScript>
                </I18nextProvider>
            </LocalizationProvider>
        </MsalProvider>
    </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
