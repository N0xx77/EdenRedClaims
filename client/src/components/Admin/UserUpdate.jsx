import EmployeeDashboard from "../EmployeeDashboard";
import axios from 'axios';
import Select from "react-select";

import { getAuthHeader } from "../Utils/auth";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, userTypeOptions, statusTypeOptions } from "../../assets/roleSelectStyle";
import { API_BASE_URL } from "../../config/api";


const UserUpdate = () => {
    const { userid } = useParams();
    const [name, setName] = useState('');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [balance, setBalance] = useState(0);
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');


    const fetchUser = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin-dashboard/users/${userid}`, {
                headers: getAuthHeader()
            });

            const data = response.data.data;
            setUser(data);
            setName(data.name);
            setBalance(data.balance);
            setRole(data.user_type);
            setStatus(data.status);

        }
        catch (err) {
            console.error(err);
            setUser(null);
            setName('');
            setBalance(0);
            setRole('');
            setErrorMessage("Unable to fetch User.");
        }
        finally {
            setLoading(false);
        }
    }

    const updateBalance = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.patch(
                `${API_BASE_URL}/api/admin-dashboard/users/balance`,
                {
                    id: userid,
                    balance: balance,
                },
                {
                    headers: getAuthHeader(),
                },
            );

            if (response.data?.success) {
                await fetchUser();
                handleBack();
                console.log('success')
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Unable to update user Balance.");
        } finally {
            setLoading(false);

        }
    }

    const updateRole = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.patch(`${API_BASE_URL}/api/admin-dashboard/users/role`,
                {
                    id: userid,
                    user_type: role
                },
                {
                    headers: getAuthHeader()
                }
            );


            if (response.data?.success) {
                setRole('');
                await fetchUser();
                handleBack();
            }
        }
        catch (err) {
            console.error(err);
            setErrorMessage("Unable to update user role...");
        } finally {
            setLoading(false);
        }
    }

    const updateStatus = async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const response = await axios.patch(`${API_BASE_URL}/api/admin-dashboard/users/status`,
                {
                    id: userid,
                    status: status
                },
                {
                    headers: getAuthHeader()
                }
            );

            if (response.data?.success) {
                setStatus('');
                await fetchUser();
                handleBack();
            }

        }
        catch (err) {
            console.log(err);
            setErrorMessage("Unable to update user Status...");
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUser();
    }, []);

    useEffect(() => {
        fetchUser();
    }, [userid]);


    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/admin-dashboard/users')

    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white pb-2">
                        Update User: <span className="text-cyan-400">{userid}</span>
                    </h1>
                    <h1 className="text-2xl font-black tracking-tight text-cyan-400">
                        {name}
                    </h1>

                </div>
                <button
                    onClick={handleBack}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold tracking-wider uppercase border border-zinc-800 rounded-lg transition"
                >
                    Back
                </button>
            </header>

            <div
                className="mb-10 flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="w-full flex flex-col gap-10 p-1">
                    <div className="w-full flex flex-row gap-5">

                        <div className="flex flex-col gap-4 w-full">
                            <label>Balance</label>
                            <input
                                type="number"
                                name="balance"
                                disabled={role === 'admin'}
                                placeholder={balance === null ? 0 : balance}
                                required
                                value={balance !== null && balance !== undefined ? balance : ""}
                                onChange={(e) => setBalance(e.target.value)}
                                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                            />
                            <div className="flex">
                                <button
                                    type="button"
                                    onClick={updateBalance}
                                    disabled={role === 'admin'}
                                    className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 
                                        transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer
                                        disabled:bg-red-500 disabled:border-b-amber-800 disabled:text-red-200 disabled:cursor-not-allowed disabled:hover:bg-red-500/40
                                        disabled:hover:border-red-400/40"
                                >
                                    Update Balance
                                </button>
                            </div>

                        </div>
                        <div className="flex flex-col gap-4 w-full">
                            <label>Role</label>
                            <Select
                                options={userTypeOptions}
                                styles={customSelectStyles}
                                placeholder="Select User Type"
                                value={userTypeOptions.find((option) => option.value === role)}
                                onChange={(selectedOption) => setRole(selectedOption.value)}
                                placeholder="Select Role"
                                menuPortalTarget={document.body}
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 
                                    transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                                onClick={updateRole}
                            >
                                Update Role
                            </button>
                        </div>
                        <div className="flex flex-col gap-4 w-full">
                            <label>Status</label>
                            <Select
                                options={statusTypeOptions}
                                styles={customSelectStyles}
                                placeholder="Select User Type"
                                value={statusTypeOptions.find((option) => option.value === status)}
                                onChange={(selectedOption) => setStatus(selectedOption.value)}
                                placeholder="Select Status"
                                menuPortalTarget={document.body}
                                className="w-full"
                            />
                            <button
                                type="button"
                                className="w-full inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 
                                    transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                                onClick={updateStatus}
                            >
                                Update Status
                            </button>
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
                </div>
            </div >

        </div >


    );
};

export default UserUpdate;



