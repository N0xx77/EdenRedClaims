import EmployeeDashboard from "../EmployeeDashboard";
import axios from 'axios';
import Select from "react-select";

import { getAuthHeader } from "../Utils/auth";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, userTypeOptions, statusTypeOptions, companiesTypeOptions } from "../../assets/roleSelectStyle";
import { API_BASE_URL } from "../../config/api";


const AdminCreateUser = ({ user, onLogout }) => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [address, setAddress] = useState('');
    const [company, setCompany] = useState('');
    const [companies, setCompanies] = useState([]);
    const companyOptions = companies.map((companyItem) => ({
        value: String(companyItem.id),
        label: companyItem.company_name,
    }));

    const createUser = async () => {
        setLoading(true);
        setErrorMessage('');

        let response = null;
        try {
            
            if (role !== 'employee') {
                if (!email || !name || !password) {
                    setErrorMessage("All required fields must be filled.");
                    return;
                }

                response = await axios.post(`${API_BASE_URL}/api/register`, {
                    email_id: email,
                    password: password,
                    name: name,
                    user_type: role,
                });
            }
            else {
                if (!email || !address || !contactNo || !name || !password) {
                    setErrorMessage("All required fields must be filled.");
                    return;
                }

                response = await axios.post(`${API_BASE_URL}/api/register`, {
                    email_id: email,
                    password: password,
                    address: address,
                    contact_number: contactNo,
                    name: name,
                    user_type: 'employee',
                    balance: 5000,
                    company_id: Number(company)
                });

            }
            if (response.data?.success) {
                handleBack();
            }
        }

        catch (err) {
            console.error(err);
            setErrorMessage("User creation failed. Please try again.");
        }
        finally {
            setLoading(false);
        }

    }

    const fetchCompanies = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/company`);
            setCompanies(Array.isArray(response.data?.data) ? response.data.data : []);
        } catch (err) {
            console.error(err);
            setErrorMessage("Unable to fetch company.");
            setCategories([]);
        }
    }

    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/admin-dashboard/users')
    }

    useEffect(() => {
        fetchCompanies();
    }, [])

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white pb-2">
                        Create User
                    </h1>
                </div>
                <button
                    onClick={handleBack}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold tracking-wider uppercase border border-zinc-800 rounded-lg transition"
                >
                    Back
                </button>
            </header>

            <div id="userType"
                className="mb-10 flex flex-col gap-6 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
            >
                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-200 text-sm font-medium text-center backdrop-blur-sm">
                        {errorMessage}
                    </div>
                )}
                <div className="flex flex-col gap-4 w-full items-center">
                    <h1 className="text-2xl font-black tracking-tight text-white pb-2">Role</h1>
                    <Select
                        required
                        options={userTypeOptions}
                        styles={customSelectStyles}
                        placeholder="Select User Type"
                        value={userTypeOptions.find((option) => option.value === role)}
                        onChange={(selectedOption) => setRole(selectedOption.value)}
                        placeholder="Select Role"
                        menuPortalTarget={document.body}
                        className="w-3/5"

                    />
                </div>
            </div >

            {(role === 'employee' || role === 'admin') && (
                <div
                    id="generalData"
                    className="mb-10 flex flex-col gap-6 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                >
                    <div className="w-full flex flex-row gap-5">
                        <div id="nameDiv" className="flex flex-col gap-3 w-130">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Max"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                        </div>
                        <div id="emailDiv" className="flex flex-col gap-3 w-130">
                            <label>Email ID</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Max@gmail.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                        </div>
                        <div id="passDiv" className="flex flex-col gap-3 w-130">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="*******"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                        </div>
                    </div>
                </div >
            )}

            {role === "employee" && (
                <div
                    id="employeeData"
                    className="mb-10 flex flex-col gap-6 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                >
                    <div className="w-full flex flex-row gap-5">
                        <div id="contactDiv" className="flex flex-col gap-3 w-full">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="9999999999"
                                pattern="[0-9]{10}"
                                required
                                maxLength="10"
                                minLength="10"
                                value={contactNo}
                                onChange={(e) => setContactNo(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                        </div>
                        <div id="addressDiv" className="flex flex-col gap-3 w-full">
                            <label>Address</label>
                            <input
                                type="text"
                                name="address"
                                placeholder="9th Mulberry Street 11th Corner"
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                        </div>
                        <div id="companyDiv" className="flex flex-col gap-3 w-full">
                            <label>Company</label>
                            <Select
                                required
                                options={companyOptions}
                                styles={customSelectStyles}
                                placeholder="Select Company"
                                value={companyOptions.find((option) => option.value === String(company))}
                                onChange={(selectedOption) => setCompany(selectedOption.value)}
                                placeholder="Select Company"
                                menuPortalTarget={document.body}
                                className="w-full"

                            />
                        </div>

                    </div>
                </div >
            )}
            <div
                id="buttonDiv"
                className="mb-10 flex flex-row gap-6 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
            >
                <div className="flex flex-row gap-5 w-full">
                    <button
                        type="button" onClick={createUser}
                        className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                    >
                        Create
                    </button>
                </div>
                <div className="flex flex-row gap-5 w-full">
                    <button
                        type="button" onClick={handleBack}
                        className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                    >
                        Back
                    </button>
                </div>
            </div >

        </div >


    );
};


{/* <div className="w-full flex flex-col gap-10 p-1">
                    <div className="w-full flex flex-row gap-5">


                        <div className="flex flex-col gap-4 w-full">

                        </div>
                        <div className="flex flex-col gap-4 w-full">

                        </div>
                    </div>

                    <div className="flex flex-row gap-5 w-half">
                        <button
                            type="button" onClick={handleBack}
                            className="w-30 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                        >
                            Back
                        </button>
                    </div>
                </div> */}
export default AdminCreateUser;



