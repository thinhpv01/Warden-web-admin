import { Container } from '@mui/system';
import { ScaleLoader } from 'react-spinners';
import color from 'src/theme/color';

export const Loading = () => {
    return (
        <Container
            sx={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <ScaleLoader color={color.primary} />
        </Container>
    );
};
