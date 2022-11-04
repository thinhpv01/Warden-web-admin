import { Button, Container, Stack, TextField, Typography } from '@mui/material';
import React from 'react';

type Props = {};

export default function ThemePage({}: Props) {
    function extractEmails(text: string) {
        return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    }

    return (
        <Container>
            <Stack
                sx={{
                    '& > *': {
                        display: 'block',
                    },
                }}
            >
                <Typography variant="h1">Variant h1</Typography>
                <Typography variant="h2">Variant h2</Typography>
                <Typography variant="h3">Variant h3</Typography>
                <Typography variant="h4">Variant h4</Typography>
                <Typography variant="h5">Variant h5</Typography>
                <Typography variant="h6">Variant h6</Typography>
                <Typography variant="body1">Variant body1</Typography>
                <Typography variant="body2">Variant body2</Typography>
                <Typography variant="button">Variant button</Typography>
                <Typography variant="caption">Variant caption</Typography>
                <Typography variant="overline">Variant overline</Typography>
                <Typography variant="subtitle1">Variant subtitle1</Typography>
                <Typography variant="subtitle2">Variant subtitle2</Typography>
            </Stack>

            <TextField
                placeholder={`Eg:\nuseremail01@gmail.com\nuseremail02@gmail.com\nuseremail03@gmail.com`}
                multiline
                fullWidth
                minRows={3}
                maxRows={10}
                onChange={(e) => {
                    console.log({ emails: extractEmails(e.target.value) });
                }}
            />

            <Stack spacing={3}>
                <Stack direction={'row'} spacing={3}>
                    <Button color="primary" variant="outlined">
                        Button variant outlined
                    </Button>
                    <Button color="primary" variant="contained">
                        Button variant contained
                    </Button>
                    <Button color="primary" variant="text">
                        Button variant text
                    </Button>
                </Stack>

                <Stack direction={'row'} spacing={3}>
                    <Button color="info" variant="outlined">
                        Button variant outlined
                    </Button>
                    <Button color="info" variant="contained">
                        Button variant contained
                    </Button>
                    <Button color="info" variant="text">
                        Button variant text
                    </Button>
                </Stack>

                <Stack direction={'row'} spacing={3}>
                    <Button color="error" variant="outlined">
                        Button variant outlined
                    </Button>
                    <Button color="error" variant="contained">
                        Button variant contained
                    </Button>
                    <Button color="error" variant="text">
                        Button variant text
                    </Button>
                </Stack>
                <Stack direction={'row'} spacing={3}>
                    <Button color="secondary" variant="outlined">
                        Button variant outlined
                    </Button>
                    <Button color="secondary" variant="contained">
                        Button variant contained
                    </Button>
                    <Button color="secondary" variant="text">
                        Button variant text
                    </Button>
                </Stack>
                <Stack direction={'row'} spacing={3}>
                    <Button color="warning" variant="outlined">
                        Button variant outlined
                    </Button>
                    <Button color="warning" variant="contained">
                        Button variant contained
                    </Button>
                    <Button color="warning" variant="text">
                        Button variant text
                    </Button>
                </Stack>

                <Stack direction={'row'} spacing={3}>
                    <Button color="warning" variant="cancel">
                        Button variant outlined
                    </Button>
                    <Button color="warning" variant="cancel">
                        Button variant contained
                    </Button>
                    <Button color="warning" variant="cancel">
                        Button variant text
                    </Button>
                </Stack>
            </Stack>
        </Container>
    );
}
