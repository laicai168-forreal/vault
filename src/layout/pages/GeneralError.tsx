import "./GeneralError.scss";

import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import { useMemo } from "react";

import CButton from "../../components/common/CButton";
import CContainer from "../../components/common/CContainer";

const GeneralError = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    const errorState = useMemo(() => {
        if (isRouteErrorResponse(error)) {
            return {
                status: error.status,
                title: error.status === 404 ? "Page Not Found" : "Something Went Wrong",
                message:
                    typeof error.data === "string"
                        ? error.data
                        : error.statusText || "An unexpected error happened.",
            };
        }

        if (error instanceof Error) {
            return {
                status: undefined,
                title: "Something Went Wrong",
                message: error.message || "An unexpected error happened.",
            };
        }

        return {
            status: undefined,
            title: "Something Went Wrong",
            message: "An unexpected error happened.",
        };
    }, [error]);

    const isUnauthorized = errorState.status === 401 || errorState.status === 403;

    return (
        <CContainer className="general-error-page">
            {isUnauthorized && (
                <div className="general-error-toast" role="status" aria-live="polite">
                    Unauthorized. Please log in to continue.
                </div>
            )}

            <div className="general-error-card">
                <div className="general-error-copy">
                    <p className="general-error-eyebrow">
                        {errorState.status ? `Error ${errorState.status}` : "Unexpected Error"}
                    </p>
                    <h1>{errorState.title}</h1>
                    <p>{errorState.message}</p>
                </div>

                <div className="general-error-actions">
                    {isUnauthorized ? (
                        <>
                            <CButton theme="outline-primary" onClick={() => navigate("/cars")}>
                                Back to Cars
                            </CButton>
                            <CButton onClick={() => navigate("/login")}>
                                Login
                            </CButton>
                        </>
                    ) : (
                        <>
                            <CButton theme="outline-primary" onClick={() => navigate(-1)}>
                                Go Back
                            </CButton>
                            <CButton onClick={() => navigate("/cars")}>
                                Back to Cars
                            </CButton>
                        </>
                    )}
                </div>
            </div>
        </CContainer>
    );
};

export default GeneralError;
