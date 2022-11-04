import { faker } from '@faker-js/faker';
import { Box, Stack, Typography } from '@mui/material';
import {
    BarController,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController
);

const labels = [...new Array(24)].map((item, index) => index);
export const options = {
    categoryPercentage: 1,
    barPercentage: 1,
    scales: {
        x: {
            grid: {
                display: false,
            },
            ticks: {
                color: '#009D4F',
                align: 'end',
            },
        },
        y: {
            beginAtZero: true,
            position: 'left',
            grid: {
                display: false,
            },
        },
        y2: {
            beginAtZero: true,
            position: 'right',
            grid: {
                display: false,
            },
        },
    },
    plugins: {
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                usePointStyle: true,
            },
        },
    },
};
export const data = {
    labels,
    datasets: [
        {
            type: 'line' as const,
            label: 'Avg. hourly visit',
            borderColor: '#70A2F5',
            borderWidth: 2,
            fill: true,
            data: labels.map(() => faker.datatype.number({ min: 0, max: 500 })),
            yAxisID: 'y2',
        },
        {
            type: 'bar' as const,
            label: 'Avg. hourly revenue',
            backgroundColor: '#DDDDDD',
            data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
            borderColor: 'white',
            borderWidth: 2,
            yAxisID: 'y',
        },
    ],
};
export default function StackBarLine() {
    return (
        <Box>
            <Chart type="bar" data={data} options={options as any} />
            <Stack direction="row" spacing={10} mt={1} ml={5.5} position="absolute">
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Box
                        sx={{
                            width: 12,
                            height: 12,
                            background: '#FFDC83',
                        }}
                    />
                    <Typography>Avg. hourly revenue</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Box
                        sx={{
                            width: 40,
                            height: 4,
                            background: (theme) => theme.palette.secondary.main,
                            borderRadius: '100px',
                        }}
                    />
                    <Typography>Avg. hourly visit</Typography>
                </Stack>
            </Stack>
        </Box>
    );
}
