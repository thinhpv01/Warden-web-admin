import { BaseTextField } from '@components/BaseTextField';
import { Button, Grid, Stack } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export default function SendMail() {
    const {
        control,
        formState: { isDirty, isValid },
    } = useForm({
        mode: 'all',
    });
    const { t } = useTranslation();

    return (
        <>
            <Grid
                container
                xs={12}
                sx={{
                    border: '1px solid #DDDDDD',
                    borderRadius: '0px 8px 8px 8px;',
                    p: '40px 16px',
                }}
            >
                <Stack width="100%" gap={2}>
                    <Controller
                        name="subject"
                        control={control}
                        rules={{
                            required: {
                                value: true,
                                message: t('wardenDetailsPage.placeHolder.error'),
                            },
                        }}
                        render={({ field, fieldState: { error } }) => (
                            <BaseTextField
                                {...field}
                                label={t('wardenDetailsPage.text.subject')}
                                required
                                maxLength={200}
                                placeholder={t('wardenDetailsPage.placeHolder.subject')}
                                fullWidth
                                error={!!error?.message}
                                helperText={error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="message"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                            <BaseTextField
                                {...field}
                                fullWidth
                                maxLength={500}
                                multiline
                                label={t('wardenDetailsPage.text.message')}
                                placeholder={t('wardenDetailsPage.placeHolder.message')}
                                rows={5}
                                error={!!error?.message}
                                helperText={error?.message}
                            />
                        )}
                    />
                </Stack>
            </Grid>
            <Stack direction="row" justifyContent="space-between" mt={4}>
                <Button variant="outlined">{t('wardenDetailsPage.button.cancel')}</Button>
                <Button variant="contained" disabled={!(isDirty && isValid)}>
                    {t('wardenDetailsPage.button.sendNow')}
                </Button>
            </Stack>
        </>
    );
}
