import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, companiesTypeOptions } from "../assets/roleSelectStyle";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../config/api";
import Select from "react-select";


export default function Login({ onLogin }) {
    const [email_id, setemail_id] = useState('');
    const [password, setpassword] = useState('');
    const [company, setCompany] = useState('');
    const [error, seterror] = useState('');

    const navigate = useNavigate();

    const normalizeUser = (userData) => ({
        userID: userData.userID ?? userData.id ?? userData.userId,
        name: userData.name,
        username: userData.username ?? userData.email_id ?? userData.email ?? email_id,
        password: userData.password,
        contact_no: userData.contact_no ?? userData.contact_number ?? '',
        address: userData.address ?? '',
        role: userData.role ?? userData.user_type ?? 'employee',
        balance: Number(userData.balance ?? 0),
        user_type: userData.user_type ?? userData.role ?? 'employee',
        company: userData.company_id
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        seterror('');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/login`, {
                email_id: email_id,
                password: password,
            })

            const { token, data } = response.data;

            const userData = normalizeUser(data);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));

            if (onLogin) {
                onLogin(userData);
            }

            if (userData.role === 'admin') {
                navigate("/admin-dashboard");
            }
            else navigate("/employee-dashboard");
        }
        catch (err) {
            seterror("Incorrect email or password, please try again");
        }

    };

    const register = () => navigate('/register');

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 font-sans">

            <div className="w-full max-w-md bg-blue-950/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8 shadow-2xl shadow-blue-950/50">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-cyan-400">
                        User Access
                    </h1>
                    <p className="text-sm text-zinc-400 mt-2 font-medium">
                        Please enter your credentials
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-200 text-sm font-medium text-center backdrop-blur-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6 pb-3">
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            type='email'
                            required
                            value={email_id}
                            onChange={(e) => setemail_id(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="........"
                            value={password}
                            onChange={(e) => setpassword(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <button
                        type="submit"
                        className="cursor-pointer w-full mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 text-cyan-300 font-bold py-3 px-4 rounded-lg text-sm tracking-wide uppercase transition shadow-cyan-950/50"
                    >
                        Login
                    </button>
                </form>
                <button
                    type="button" onClick={register}
                    className="w-full mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 text-cyan-300 font-bold py-3 px-4 rounded-lg text-sm tracking-wide uppercase transition shadow-cyan-950/50 cursor-pointer"
                >
                    Register
                </button>
            </div>
        </div>
    )
}