import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/auth.css';
import '../styles/components/logo.css'
import '../styles/components/button.css'

const Loginschema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
});

const Login = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const response = await axios.post('/api/auth/login', values);
            const { user } = response.data; // Supposons que l'API retourne un objet utilisateur
            
            if (user.is_first_login) {
                navigate('/select-country'); // Première étape après la connexion
            } else {
                navigate('/profile');
            }
        } catch (error) {
            console.log(error);
            setErrorMessage("Invalid email or password");
        }
    };

    return (
        <div id="auth-container">
            <div id='logo'>
                <div id='div1'><i className="fa-solid fa-heart"></i></div>
                <div id='div2'></div>
            </div>
            <h2>Login to Your Account</h2>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Loginschema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form id="auth-form">
                        <div id='email'>
                            <i className="fa-solid fa-envelope"></i>
                            <Field name="email" type="email" placeholder="Email" />
                        </div>

                        <div id='password'>
                            <i className="fa-solid fa-lock"></i>
                            <Field name="password" type="password" placeholder="Password" />
                        </div>

                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        <button id='authButton' type="submit">Sign in</button>
                    </Form>
                )}
            </Formik>
            <div id="login-link">
                <p>Don't have an account ? <Link to="/register" id='redirect-link'> Sign up</Link></p>
            </div>
        </div>
    );
};

export default Login;
