import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { auth } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import router from 'next/router';

interface LoginFormData {
    email: string;
    password: string;
}

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function signUp() {
        try {
            createUserWithEmailAndPassword(auth, email, password);
            const next = router.query.next as typeof router.asPath || "/" as typeof router.asPath;
            router.push(next);
        } catch (e) {
            console.log(e);
        }
    }

    function login() {
        try {
            signInWithEmailAndPassword(auth, email, password)
            .then(({ user }) => {
                console.log(user)
            })
            .then(() => {
                const next = (router.query.next || "/") as string;
                router.replace({
                    pathname: next,
                });
            })
        } catch (e) {
            console.log(e);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <>
            <div className="container">
                <div className="row justify-content-center mt-5">
                    <div className="col-md-6">
                        <Form onSubmit={handleSubmit}>
                            <h2 className='mb-3'>Login / Create Account</h2>
                            <Form.Group controlId="formEmail" className='mb-2'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter email"
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="formPassword" className='mb-5'>
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Password"
                                    required
                                />
                            </Form.Group>
                            <div className='row justify-content-around'>
                                <div className='col'>
                                    <Button variant="primary" type="button" onClick={login}>
                                        Sign in
                                    </Button>
                                </div>
                                <div className='col text-end'>
                                    <Button variant="primary" type="button" onClick={signUp}>
                                        Sign up
                                    </Button>
                                </div>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </>
    )
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
    });


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="container">
            <div className="row justify-content-center mt-5">
                <div className="col-md-6">
                    <Form onSubmit={handleSubmit}>
                        <h2>Login</h2>

                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email"
                                required
                            />
                        </Form.Group>

                        <Form.Group controlId="formPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;