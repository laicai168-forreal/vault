import {
    CognitoUserPool,
    CognitoUser,
    CognitoUserSession,
    CognitoUserAttribute,
    ISignUpResult,
    ICognitoUserData,
    AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { ConfirmEmailData, SignUpData } from "./authSlice";

const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
};

export const userPool = new CognitoUserPool(poolData);

export const getCurrentUser = (): CognitoUser | null => {
    return userPool.getCurrentUser();
};

export const signInService = (userId: string, password: string) => {
    const authenticationData = {
        Username: userId,
        Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(
        authenticationData
    );
    const userData: ICognitoUserData = {
        Username: userId,
        Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);


    return new Promise<CognitoUserSession>((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                resolve(result);
            },

            onFailure: function (err) {
                reject(err);
            },
        });
    })
};

export const signOutService = (userId: string) => {
    if (userId) {
        const cognitoUser = userPool.getCurrentUser();

        if (!cognitoUser) {
            return Promise.reject("User is not authenticated");
        }

        return new Promise((resolve, reject) => {
            try {
                cognitoUser.signOut();
                resolve("User signed out locally");
            } catch (error) {
                reject(error);
            }
        })
    }
};

export const refreshSessionService = (): Promise<CognitoUserSession> => {
    return new Promise((resolve, reject) => {
        const user = getCurrentUser();

        if (!user) {
            reject("No current user");
            return;
        }

        user.getSession((err: Error, session: CognitoUserSession | null) => {
            if (err || !session) {
                reject("Session invalid");
                return;
            }

            if (session.isValid()) {
                resolve(session);
                return;
            }

            const refreshToken = session.getRefreshToken();
            user.refreshSession(refreshToken, (refreshErr, newSession) => {
                if (refreshErr) {
                    reject(refreshErr);
                } else {
                    resolve(newSession);
                }
            });
        });
    });
};

export const signUpService = ({
    email,
    phone,
    password,
    displayedName,
}: SignUpData): Promise<ISignUpResult | undefined> => {
    return new Promise((resolve, reject) => {
        const attributes: CognitoUserAttribute[] = [];

        if (email) {
            attributes.push(
                new CognitoUserAttribute({ Name: 'email', Value: email })
            );
        }

        if (phone) {
            attributes.push(
                new CognitoUserAttribute({ Name: 'phone_number', Value: phone })
            );
        }

        attributes.push(
            new CognitoUserAttribute({
                Name: 'preferred_username',
                Value: displayedName,
            })
        );

        const username = email || phone!;

        userPool.signUp(
            username,
            password,
            attributes,
            [],
            (err, data) => {
                if (err) {
                    reject(new Error(err.message || 'Sign up failed'));
                } else {
                    resolve(data);
                }
            }
        );
    });
};

export const confirmSignUpService = ({ username, code }: ConfirmEmailData) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        });

        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

export const resendConfirmationService = (username: string) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
            Username: username,
            Pool: userPool,
        });

        cognitoUser.resendConfirmationCode((err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

export const forgetPassword = (email: string) => {
    return new Promise((resolve, reject) => {
        if (email) {
            const userData: ICognitoUserData = {
                Username: email,
                Pool: userPool,
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.forgotPassword({
                onSuccess: function (data) {
                    resolve(data);
                },
                onFailure: function (err) {
                    reject(err)
                },
            });
        } else {
            return new Error('No email was given')
        }
    })
};

export const verifyCodeAndSetNewPassword = (verificationCode: string, newPassword: string, email: string) => {
    return new Promise((resolve, reject) => {
        if (email) {
            const userData: ICognitoUserData = {
                Username: email,
                Pool: userPool,
            };

            const cognitoUser = new CognitoUser(userData);
            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess(data) {
                    resolve(data)
                },
                onFailure(err) {
                    reject(err);
                },
            });
        }
    })
};



export const changePassword = (email: string, oldPassword: string, newPassword: string) => {
    return new Promise((resolve, reject) => {
        if (email) {
            const userData: ICognitoUserData = {
                Username: email,
                Pool: userPool,
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.changePassword(
                oldPassword,
                newPassword,
                function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data)
                    }
                }
            );
        }
    })
};
