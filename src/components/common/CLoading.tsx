import { Backdrop, CircularProgress } from "@mui/material";
import "./CLoading.scss";

interface CLoadingProps {
    loading: boolean;
}

const CLoading = ({ loading }: CLoadingProps) => {
    return (
        <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={loading}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}

export default CLoading;