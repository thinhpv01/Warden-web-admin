import { Stack, TextField, TextFieldProps, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { omit } from "lodash";

export const STextField = styled(TextField)({
    // "& input:valid + fieldset": {
    //   borderColor: "green",
    //   borderWidth: 2
    // },
    // "& .MuiOutlinedInput-input + fieldset": {
    //     border: "transparent",
    // },
    // "& input": {
    //     background: "#2A2B31",
    //     padding: "10px 14px",
    //     borderRadius: "inherit",
    // },
    // "& .MuiInputBase-multiline": {
    //     background: "#2A2B31",
    //     padding: "10px 14px",
    // },
    // "& .MuiOutlinedInput-notchedOutline": {
    //     borderColor: "red",
    // },
    // "& .Mui-error .MuiOutlinedInput-notchedOutline": {
    //     borderColor: "red !important",
    //     boxShadow: "0px 0px 10px 2px rgba(239, 19, 32, 0.47)",
    //     transition:
    //         "border-color 500ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
    // },
    // "& .Mui-error input + fieldset": {
    //     background: "none !important",
    //     border: "1px solid red",
    // },
    // "& .Mui-error input ": {
    //     background: "none !important",
    // },
    // "& .Mui-error input:focus + fieldset": {
    //     borderWidth: 2,
    //     borderColor: "red !important",
    // },
    // "& .MuiFormHelperText-root": {
    //     marginLeft: 0,
    //     fontSize: "0.72rem",
    //     fontWeight: 400,
    //     color: "red",
    // },
    // "& .MuiOutlinedInput-root": {
    //     "&.Mui-focused fieldset": {
    //         borderColor: "transparent",
    //     },
    // },
});

type Props = {
    maxLength?: number;
};

export const BaseTextField = (props: TextFieldProps & Props) => {
    return (
        <Stack spacing={0.5} width={"100%"}>
            <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                <Typography
                    variant="subtitle1"
                    fontSize={13}
                    fontWeight={500}
                    sx={{
                        color: props.error ? (theme) => theme.palette.error.main : "inherit",
                        transition:
                            "color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,transform 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms,max-width 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
                    }}
                >
                    {props.label}
                    {/* {props.required && <span style={{ color: "red" }}>{" *"}</span>} */}
                </Typography>

                {props.maxLength && (
                    <Typography fontWeight={500} fontSize={12}>{`${
                        ((props.value ?? "") as string).length
                    }/${props.maxLength}`}</Typography>
                )}
            </Stack>

            <STextField
                inputProps={{ maxLength: props.maxLength }}
                {...omit(props, "required", "label")}
                autoComplete={"off"}
            />
        </Stack>
    );
};
