import React, { useCallback, useEffect, useReducer } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import CButton from '../../components/common/CButton';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';

import '../../styles/CreateAccount.scss';
import { confirmEmail, sendConfirmEmail } from '../../store/auth/authSlice';

const ChangePassword = () => {
    const defaultConfirmationData = {
        code: '',
        username: '',
    }

    const [confirmationData, updateConfirmationData] = useReducer((prev, next) => {
        return { ...prev, ...next }
    }, defaultConfirmationData);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const confirmEmaiFromParams = searchParams.get('confirm_email');
        if (confirmEmaiFromParams) {
            updateConfirmationData({ userId: confirmEmaiFromParams });
        } else {
            navigate('/login');
        }
    }, [searchParams])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        dispatch(confirmEmail(confirmationData)).then(() => {
            // navigate('/all');
        });

    }, [confirmationData]);

    const handleResend = () => {
        dispatch(sendConfirmEmail(confirmationData.username))
            .unwrap();
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
                <CButton type="button" onClick={handleResend}>Resend Code</CButton>
                <CButton type='submit'>Verify</CButton>
                <a href='/login'>Login</a>
            </form>
            <div>
                <h3>Debug</h3>
                <div>{JSON.stringify(confirmationData)}</div>
            </div>
        </div>
    )
}

export default ChangePassword;