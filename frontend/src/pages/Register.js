import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useWhoAmI } from '../context/WhoAmIContext';
import '../styles/auth.css';
import '../styles/components/logo.css'
import '../styles/components/button.css'

const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
});

const Register = () => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const { refetchMe } = useWhoAmI();

    const handleSubmit = async (values) => {
        try {
            await axios.post('/api/auth/register', values);
            // Try to login automatically after registration
            try {
                await axios.post('/api/auth/login', {
                    email: values.email,
                    password: values.password
                });
                // Update authentication context
                await refetchMe();
            } catch (loginError) {
                console.error("Auto-login failed after registration:", loginError);
            }
            
            navigate('/unverified');
        } catch (error) {
            if (error.response && error.response.data) {
                setErrorMessage(error.response.data.message || "Error registering user");
            } else {
                setErrorMessage("Error registering user");
            }
        }
    }

    return (
        <div id="auth-container">
            <div id='logo'>
                <div id='div1'><i className="fa-solid fa-heart"></i></div>
                <div id='div2'></div>
            </div>
            <h2>Create Your Account</h2>
            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
            >
                {({ errors, touched }) => (
                    <Form id="auth-form">
                        <div id='name'>
                            <i className="fa-solid fa-user"></i>
                            <Field name="name" type="text" placeholder="Name" />
                        </div>
                        <div id='email'>
                            <i className="fa-solid fa-envelope"></i>
                            <Field name="email" type="email" placeholder="Email" />
                        </div>
                        <div id='password'>
                            <i className="fa-solid fa-lock"></i>
                            <Field name="password" type="password" placeholder="Password" />
                        </div>
                        
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        
                        <button id='authButton' type="submit">Sign up</button>
                    </Form>
                )}
            </Formik>
            <div id="login-link">
                <p>Already registered ? <Link to="/login" id='redirect-link'> Sign in</Link></p>
            </div>
        </div>
    );
};

export default Register;
