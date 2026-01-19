import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setMessage({ text: 'Verifique seu e-mail para confirmar o cadastro!', type: 'success' })
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            }
        } catch (error: any) {
            setMessage({ text: error.error_description || error.message, type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold text-center mb-2 text-blue-900">
                    <i className="fa-solid fa-graduation-cap mr-2"></i>
                    CertificaMaster
                </h1>
                <p className="text-center text-gray-500 mb-8 text-sm">
                    {isSignUp ? 'Crie sua conta para começar' : 'Faça login para acessar seus certificados'}
                </p>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        {message.type === 'success' && <i className="fa-solid fa-check-circle mr-2"></i>}
                        {message.type === 'error' && <i className="fa-solid fa-circle-exclamation mr-2"></i>}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fa-solid fa-envelope"></i>
                            </div>
                            <input
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Senha</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <i className="fa-solid fa-lock"></i>
                            </div>
                            <input
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                type="password"
                                placeholder="Sua senha segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button
                        className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
                        disabled={loading}
                    >
                        {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : (isSignUp ? 'Cadastrar' : 'Entrar')}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <button
                        onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
                        className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
                    >
                        {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
            <p className="mt-8 text-xs text-gray-400"> v2.1.0 • Produção</p>
        </div>
    )
}
