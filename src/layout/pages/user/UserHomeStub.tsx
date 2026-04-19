import { useMemo } from "react";
import { useParams } from "react-router-dom";

import CContainer from "../../../components/common/CContainer";

const UserHomeStub = () => {
    const { userId } = useParams();

    const title = useMemo(() => {
        return userId ? `Collector ${userId.slice(0, 8)}` : "Collector";
    }, [userId]);

    return (
        <CContainer className="user-home-stub-page">
            <h1>{title}</h1>
            <p>This collector page is not implemented yet.</p>
            <p>The owner links from car detail are now wired here so we can flesh out the real public profile later.</p>
        </CContainer>
    );
};

export default UserHomeStub;
