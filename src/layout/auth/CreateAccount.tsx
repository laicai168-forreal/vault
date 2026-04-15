import React, { useCallback, useReducer, useState } from 'react';
import '../../styles/CreateAccount.scss';
import useAppDispatch from '../../hooks/useAppDispatch';
import { createSearchParams, useNavigate } from 'react-router';
import CInput from '../../components/common/CInput';
import CButton from '../../components/common/CButton';

import CInfoBlock from '../../components/common/CInfoBlock';
import CLink from '../../components/common/CLink';
import { signUp } from '../../store/auth/authSlice';

const CreateAccount = () => {
    const defaultSignUpData = {
        userId: '',
        displayedName: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
    }

    const [signUpData, updateSignUpData] = useReducer((prev, next) => {
        return { ...prev, ...next }
    }, defaultSignUpData);
    const [formErrors, setFormErrors] = useState<string[]>([]);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const validate = () => {
        const {
            email,
            password,
            confirmPassword,
            displayedName,
            phone,
        } = signUpData;

        const errors = [];

        if (!email && !phone) {
            errors.push("Either email or phone is required");
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Please enter the correct email format");
        if (!password.trim()) errors.push("Password is required");
        if (!confirmPassword.trim()) errors.push("Please enter to confirm your password");
        if (password && password.length < 8) errors.push("Password should be more than 8 chars");
        if (password && confirmPassword && password !== confirmPassword) errors.push("Password should match");
        if (!displayedName.trim()) errors.push("Displayed name is required");
        return errors;
    };

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const errors = validate();
        setFormErrors(errors);
        if (errors.length) return;

        // Now using email as the default userId
        dispatch(signUp({ ...signUpData }))
            .unwrap()
            .then(
                (res) => {
                    navigate({
                        pathname: "/confirm_registration",
                        search: createSearchParams({
                            username: signUpData.email || signUpData.phone!,
                        }).toString(),
                    });
                }
            )
            .catch(
                (error) => {
                    console.log(error);
                }
            )
    }, [signUpData]);

    return (
        <div className='container'>
            <CInfoBlock type='error' show={!!formErrors.length}>
                {
                    formErrors.map((error) => (
                        <p key={error}>{error}</p>
                    ))
                }
            </CInfoBlock>
            <form onSubmit={handleSubmit} noValidate>
                {/* <CInput
                    value={signUpData.userId}
                    label='ID'
                    type='text'
                    name='userId'
                    fieldKey='userId'
                    onChange={updateSignUpData}
                /> */}
                <CInput
                    value={signUpData.email}
                    label='Email'
                    type='email'
                    name='email'
                    fieldKey='email'
                    onChange={updateSignUpData}
                />
                <CInput
                    value={signUpData.phone}
                    label='Phone Number'
                    type='text'
                    name='phone'
                    fieldKey='phone'
                    onChange={updateSignUpData}
                />
                <CInput
                    value={signUpData.password}
                    label='Password'
                    type='password'
                    name='password'
                    fieldKey='password'
                    onChange={updateSignUpData}
                />
                <CInput
                    value={signUpData.confirmPassword}
                    label='Confirm Password'
                    type='password'
                    name='confirmPassword'
                    fieldKey='confirmPassword'
                    onChange={updateSignUpData}
                />
                <CInput
                    value={signUpData.displayedName}
                    label='Displayed Name'
                    type='text'
                    name='displayedName'
                    fieldKey='displayedName'
                    onChange={updateSignUpData}
                />
                <CButton type='submit'>Submit</CButton>
                <CLink href='/login'>Login</CLink>
            </form>
        </div>
    )
}

export default CreateAccount;
