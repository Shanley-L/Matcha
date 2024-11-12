import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const Loginschema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
});

const Login = () => {
    const handleSubmit = async (values) => {
        try {
            const response = await axios.post('http://localhost/api/auth/login', values);
            console.log(response.data);
        } catch (error) {
            console.log(error);
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