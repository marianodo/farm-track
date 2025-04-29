"use client";

import { useState } from 'react';
import Link from 'next/link'

// import { useAuthStore } from '@/store/authStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // const login = useAuthStore((state) => state.login);

    const handleLogin = async (e: React.FormEvent) => {
        // e.preventDefault();

        // if (!email || !password) {
        //     toast({
        //         variant: "destructive",
        //         title: "Error de validación",
        //         description: "Por favor complete todos los campos"
        //     });
        //     return;
        // }

        // setIsLoading(true);

        // try {
        //     // const success = await login(email, password);

        //     if (success) {
        //         toast({
        //             title: "Inicio de sesión exitoso",
        //             description: "Bienvenido a Measure Me"
        //         });
        //         navigate('/dashboard');
        //     } else {
        //         toast({
        //             variant: "destructive",
        //             title: "Error de autenticación",
        //             description: "Correo electrónico o contraseña incorrectos"
        //         });
        //     }
        // } catch (error) {
        //     toast({
        //         variant: "destructive",
        //         title: "Error",
        //         description: "Ocurrió un error durante el inicio de sesión"
        //     });
        // } finally {
        //     setIsLoading(false);
        // }
    };

    return (
        <div className="min-h-screen flex items-center justify-center w-full bg-background-green-light">
            <div className="w-full max-w-lg shadow-lg border bg-white px-8 rounded-lg py-8">
                <div className="space-y-1">
                    <div className="flex justify-center pb-2">
                        <h1 className="text-3xl font-bold text-green-dark">Measure Me</h1>
                    </div>
                    <div className="text-2xl font-bold text-center text-black">Iniciar Sesión</div>
                    <div className="text-center text-parrafos">
                        Ingrese sus credenciales para acceder a su cuenta
                    </div>
                </div>
                <div className="py-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="">
                            <input
                                type="email"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-green-dark text-white font-semibold p-2 rounded-md text-sm hover:bg-lime-700 cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
                <div className="flex flex-wrap justify-center pb-6">
                    <div className="text-center text-sm text-parrafos">
                        ¿No tienes una cuenta?{" "}
                        <Link href="/register" className="text-green-dark hover:text-lime-600 font-semibold">
                            Regístrate
                        </Link>
                    </div>
                </div>
                <div className="text-center text-sm text-parrafos">
                    Ir a protected{" "}
                    <Link href="/dashboard" className="text-green-dark hover:text-lime-600 font-semibold">
                        Ir a protected
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;