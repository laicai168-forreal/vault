import React, { useCallback, useEffect, useReducer } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import CButton from '../../components/common/CButton';
import CInfoBlock from '../../components/common/CInfoBlock';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';

import '../../styles/CreateAccount.scss';
import { usePersistentCountdown } from '../../hooks/usePersistentCountdown';
import CLink from '../../components/common/CLink';
import { confirmEmail, sendConfirmEmail } from '../../store/auth/authSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const ConfirmRegitstration = () => {
    const defaultConfirmationData = {
        code: '',
        username: '',
      };

    const [confirmationData, updateConfirmationData] = useReducer((prev, next) => {
        return { ...prev, ...next }
    }, defaultConfirmationData);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { error, loading } = useSelector((state: RootState) => state.auth);

    const sendCountdown = usePersistentCountdown(
        "wip:auth:confirm_registration:resend_code",
        {
            duration: 60,
        }
    );

    useEffect(() => {
        const usernameFromParams = searchParams.get('username') || searchParams.get('confirm_email');
        if (usernameFromParams) {
            updateConfirmationData({ username: usernameFromParams });
        } else {
            navigate('/login');
          }
    }, [searchParams])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        dispatch(confirmEmail(confirmationData))
            .unwrap()
            .then(() => {
                sendCountdown.clear();
                navigate({
                    pathname: '/login',
                    search: new URLSearchParams({
                        confirmed: '1',
                        username: confirmationData.username,
                    }).toString(),
                });
            })
            .catch((err) => console.log(err));

    }, [confirmationData, dispatch, navigate, sendCountdown]);

    const handleResend = () => {
        if (sendCountdown.canStart) {
            dispatch(sendConfirmEmail(confirmationData.username))
                .unwrap()
                .then(() => {
                    sendCountdown.start();
                })
                .catch((err) => console.log(err));
        }
    }

    return (
        <div className='container'>
            <h2>Confirm Email</h2>
            <CInfoBlock type='error' show={!!error}>
                {error}
            </CInfoBlock>
            <form onSubmit={handleSubmit} noValidate>
                <CInput
                    value={confirmationData.code}
                    label='Confirmation code'
                    type='text'
                    name='confirmationCode'
                    fieldKey='code'
                    onChange={updateConfirmationData}
                />
                <CButton type="button" onClick={handleResend} disabled={sendCountdown.isActive || loading}>
                    Resend Code{sendCountdown.isActive && ` (${sendCountdown.secondsLeft}s)`}
                </CButton>
                <CButton type='submit' loading={loading}>Verify</CButton>
                <CLink href='/login'>Login</CLink>
            </form>
        </div>
    )
}

export default ConfirmRegitstration;
