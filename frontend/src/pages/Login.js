import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';

const Loginschema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
});

const Login = () => {
    const handleSubmit = async (values) => {
        try {
            const response = await axios.get('/api/user/profile', values); // needs one log to work
            // const response = await axios.post('/api/auth/login', values);
            console.log(response.data);
            alert("User logged in successfully");
        } catch (error) {
            console.log(error);
            alert("Error logging in user");
        }
    }

    return (
        <div>
            <h2>Login</h2>
            <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={Loginschema}
                onSubmit={handleSubmit}
                >
                {({ errors, touched }) => (
                    <Form>
                        <div>
                            <Field name="email" type="email" placeholder="Email" />
                            {errors.email && touched.email ? <div>{errors.email}</div> : null}
                        </div>
                        <div>
                            <Field name="password" type="password" placeholder="Password" />
                            {errors.password && touched.password ? <div>{errors.password}</div> : null}
                        </div>
                        <button type="submit">Submit</button>
                    </Form>
                )}
                </Formik>
        </div> 
    );
};

export default Login;