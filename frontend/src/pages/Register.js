import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from '../config/axios';


const RegisterSchema = Yup.object().shape({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().required('Required')
});

const Register = () => {
    const handleSubmit = async (values) => {
        try {
            console.log("testing...")
            const response = await axios.post('/api/auth/register', values);
            console.log(response.data);
            alert("User registered successfully");
        } catch (error) {
            console.log(error);
            alert("Error registering user");
        }
    }

    return (
        <div>
            <h2>Register</h2>
            <Formik
                initialValues={{ name: '', email: '', password: '' }}
                validationSchema={RegisterSchema}
                onSubmit={handleSubmit}
                >
                {({ errors, touched }) => (
                    <Form>
                        <div>
                            <Field name="name" type="text" placeholder="Name" />
                            {errors.name && touched.name ? <div>{errors.name}</div> : null}
                        </div>
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

export default Register;