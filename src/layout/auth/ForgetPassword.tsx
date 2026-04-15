import React, { useCallback, useEffect, useReducer } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router';
import CButton from '../../components/common/CButton';
import CInfoBlock from '../../components/common/CInfoBlock';
import CInput from '../../components/common/CInput';
import useAppDispatch from '../../hooks/useAppDispatch';
import { usePersistentCountdown } from '../../hooks/usePersistentCountdown';
import { RootState } from '../../store/store';
import '../../styles/CreateAccount.scss';
import CLink from '../../components/common/CLink';
import { sendForgetPasswordEmail, verifyCodeAndSetPassword } from '../../store/auth/authSlice';


const ForgetPassword = () => {
    const defaultConfirmationData = {
        code: '',
        userId: '',
        newPassword: '',
    }

    const [forgetPasswordData, updateForgetPasswordData] = useReducer((prev, next) => {
        return { ...prev, ...next }
    }, defaultConfirmationData);

    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { error } = useSelector((state: RootState) => state.auth);
    const sendCountdown = usePersistentCountdown(
        "wip:auth:forget_password:resend_code",
        {
            duration: 60,
        }
    );

    useEffect(() => {
        const confirmEmaiFromParams = searchParams.get('id');
        if (confirmEmaiFromParams) {
            updateForgetPasswordData({ userId: confirmEmaiFromParams });
        }
    }, [searchParams])

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const { code, userId, newPassword } = forgetPasswordData;
        dispatch(verifyCodeAndSetPassword({
            code,
            newPassword,
            email: userId,
        }))
            .then(() => {
                sendCountdown.clear();
            })
            .catch((err) => {
                console.log(err);
            });

    }, [forgetPasswordData]);

    const handleResend = () => {
        const { userId } = forgetPasswordData;
        if (sendCountdown.canStart) {
            dispatch(sendForgetPasswordEmail(userId))
                .unwrap()
                .then(() => {
                    sendCountdown.start();
                    setSearchParams(prev => {
                        prev.set("id", userId);
                        return prev;
                    });
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }

    return (
        <div className='container'>
            <h2>Reset Password</h2>
            <CInfoBlock type='error' show={!!error}>
                {error}
            </CInfoBlock>
            <form onSubmit={handleSubmit} noValidate>
                <CInput
                    value={forgetPasswordData.userId}
                    label='Email'
                    type='text'
                    name='email'
                    fieldKey='userId'
                    onChange={updateForgetPasswordData}
                />
                <CButton
                    type='button'
                    onClick={handleResend}
                    disabled={sendCountdown.isActive}
                >
                    Send Code{sendCountdown.isActive && ` (${sendCountdown.secondsLeft}s)`}
                </CButton>
                {
                    searchParams.get('id') && 
                    <>
                        <CInput
                            value={forgetPasswordData.code}
                            label='Confirmation Code'
                            type='text'
                            name='confirmationCode'
                            fieldKey='code'
                            onChange={updateForgetPasswordData}
                        />
                        <CInput
                            value={forgetPasswordData.newPassword}
                            label='New Password'
                            type='password'
                            name='newPassword'
                            fieldKey='newPassword'
                            onChange={updateForgetPasswordData}
                        />
                        <CButton type="submit">Reset Password</CButton>
                    </>
                }
                
                <CLink href='/login'>Login</CLink>
            </form>
        </div>
    )
}

export default ForgetPassword;
