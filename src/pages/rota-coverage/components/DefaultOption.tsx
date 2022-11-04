import { Typography } from "@mui/material";
import React from "react";

type Props = { title: string };

export default function DefaultOption({ title }: Props) {
    return (
        <Typography color="secondary.main" py={1.5} sx={{ borderBottom: "1px solid #eee" }}>
            {title}
        </Typography>
    );
}
