import React, { useCallback, useEffect, useReducer } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import CButton from '../../components/common/CButton';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';

import '../../styles/CreateAccount.scss';
import { usePersistentCountdown } from '../../hooks/usePersistentCountdown';
import CLink from '../../components/common/CLink';
import { confirmEmail, sendConfirmEmail } from '../../store/auth/authSlice';

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

    const sendCountdown = usePersistentCountdown(
        "wip:auth:confirm_registration:resend_code",
        {
            duration: 60,
        }
    );

    useEffect(() => {
        const usernameFromParams = searchParams.get('username');
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
            })
            .catch((err) => console.log(err));

    }, [confirmationData]);

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
            <form onSubmit={handleSubmit} noValidate>
                <CInput
                    value={confirmationData.code}
                    label='Confirmation code'
                    type='text'
                    name='confirmationCode'
                    fieldKey='code'
                    onChange={updateConfirmationData}
                />
                <CButton type="button" onClick={handleResend}>Resend Code{sendCountdown.isActive && ` (${sendCountdown.secondsLeft}s)`}</CButton>
                <CButton type='submit'>Verify</CButton>
                <CLink href='/login'>Login</CLink>
            </form>
            <div>
                <h3>Debug</h3>
                <div>{JSON.stringify(confirmationData)}</div>
            </div>
        </div>
    )
}

export default ConfirmRegitstration;