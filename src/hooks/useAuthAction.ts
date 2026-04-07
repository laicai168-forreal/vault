import { useDispatch, useSelector } from "react-redux";
import { showLoginModal } from "../store/auth/authSlice";
import { RootState } from "../store/store";
import { useCallback } from "react";
import { useNavigate } from "react-router";

// export function useAuthAction<T extends any[]>(
//     action: (...args: T) => void
// ) {
//     const isAuthed = useSelector((s: RootState) => s.auth.isAuthenticated);
//     const dispatch = useDispatch();

//     return useCallback(
//         (...args: T) => {
//             if (!isAuthed) {
//                 dispatch(showLoginModal());
//                 return;
//             }
//             action(...args);
//         },
//         [isAuthed, dispatch, action]
//     );
//   }

export function useAuthAction<T extends (...args: any[]) => any>(fn: T) {
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Return a wrapped function
    return useCallback((...args: Parameters<T>) => {
        if (!isAuthenticated) {
            dispatch(showLoginModal());
            console.log('here');
            // TODO: Currently using redirection, we will evolove to use modal in page for user's convenience
            navigate('/login');
            return;
        }
        return fn(...args); // call the original function
    }, [isAuthenticated, dispatch, fn]);
}