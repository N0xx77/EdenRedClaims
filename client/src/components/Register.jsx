import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, companiesTypeOptions } from "../assets/roleSelectStyle";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../config/api";
import Select from "react-select";


export default function Register({ onLogin }) {
    const [email_id, setEmail_id] = useState('');
    const [password, setPassword] = useState('');
    const [contact_number, setContact_number] = useState('');
    const [address, setAddress] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [companies, setCompanies] = useState([]);

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
        company: userData.company
    });

    const companyOptions = companies.map((companyItem) => ({
        value: String(companyItem.id),
        label: companyItem.company_name,
    }));

    const [error, seterror] = useState('');

    const navigate = useNavigate();

    const validateForm = () => {
        if (!email_id || !address || !contact_number || !name || !password || !company) {
            return "All required fields must be filled.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email_id)) {
            return "Please enter a valid email address.";
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(contact_number)) {
            return "Contact number must be exactly 10 digits.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters long.";
        }

        if (name.trim().length < 2) {
            return "Name must be at least 2 characters long.";
        }

        return null;
    };

    const handleRegister = async (e) => {
        seterror('');
        e.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            seterror(validationError);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/api/register`, {
                email_id: email_id,
                password: password,
                address: address,
                contact_number: contact_number,
                name: name,
                user_type: 'employee',
                company_id: Number(company),
                balance: 5000
            });

            navigate('/login');
        }
        catch (err) {
            seterror(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        }

    };

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/company`);
            setCompanies(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch (err) {
            console.error(err);
            setErrorMessage("Unable to fetch company.");
            setCategories([]);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleBack = () => navigate('/login')

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center px-4 font-sans">

            <div className="w-full max-w-md bg-blue-950/40 backdrop-blur-md border border-blue-500/30 rounded-2xl p-8 shadow-2xl shadow-blue-950/50">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold tracking-tight text-cyan-400">
                        Register
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
                <form className="space-y-3">
                    <div >
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Name
                        </label>
                        <input
                            type='text'
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Email
                        </label>
                        <input
                            type='email'
                            required
                            value={email_id}
                            onChange={(e) => setEmail_id(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="9999999999"
                            pattern="[0-9]{10}"
                            required
                            maxLength="10"
                            minLength="10"
                            value={contact_number}
                            onChange={(e) => setContact_number(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Address
                        </label>
                        <input
                            type='text'
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div>
                        <label
                            className="block text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                            Company Name
                        </label>
                        <Select
                            options={companyOptions}
                            required
                            styles={customSelectStyles}
                            placeholder="Select Company Type"
                            value={companyOptions.find((option) => option.value === String(company))}
                            onChange={(selectedOption) => setCompany(selectedOption.value)}
                            placeholder="Select Company"
                            menuPortalTarget={document.body}
                            className="w-full"
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
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900/60 text-white placeholder-zinc-500 border border-zinc-700 focus:border-cyan-400 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400 transition"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4 justify-items-end">
                        <button
                            type="button" onClick={handleRegister}
                            className="w-full mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 text-cyan-300 font-bold py-3 px-4 rounded-lg text-sm tracking-wide uppercase transition shadow-cyan-950/50"
                        >
                            Login
                        </button>
                        <button
                            type="button" onClick={handleBack}
                            className="w-full mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 hover:border-cyan-400 text-cyan-300 font-bold py-3 px-4 rounded-lg text-sm tracking-wide uppercase transition shadow-cyan-950/50"
                        >
                            Back
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}