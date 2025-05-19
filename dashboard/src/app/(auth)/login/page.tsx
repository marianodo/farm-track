"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
// import { useAuthStore } from '@/store/authStore';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, authLoading, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            return alert('Por favor complete todos los campos');
        }

        // setIsLoading(true);

        try {
            await login(email, password);
            router.replace('/dashboard');
        } catch (error) {
            alert(error?.message);
        }
    };

    // useEffect(() => {
    //     if (isAuthenticated) {
    //         router.replace('/dashboard');
    //     }
    // }, [isAuthenticated, router]);

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