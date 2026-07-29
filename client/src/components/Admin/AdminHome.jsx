import React, { useState, useEffect } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAuthHeader } from "../Utils/auth";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { API_BASE_URL } from "../../config/api";

const AdminHome = ({ user, onLogout }) => {
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [userStats, setUserStats] = useState([
        { name: "Employees", value: 0 },
        { name: "Admins", value: 0 }
    ]);
    const [claimStats, setClaimStats] = useState([
        { name: "Pending", value: 0 },
        { name: "Approved", value: 0 },
        { name: "Rejected", value: 0 }
    ]);

    const fetchDashboardMetrics = async () => {
        setLoading(true);
        setErrorMessage("");
        try {
            const userResponse = await axios.get(
                `${API_BASE_URL}/api/admin-dashboard/users`,
                { headers: getAuthHeader() }
            );
            const fetchedUsers = Array.isArray(userResponse.data?.data) 
                ? userResponse.data.data 
                : (Array.isArray(userResponse.data) ? userResponse.data : []);

            const employeeCount = fetchedUsers.filter((u) => u.user_type === "employee").length;
            const adminCount = fetchedUsers.filter((u) => u.user_type === "admin").length;
            setUserStats([
                { name: "Employees", value: employeeCount },
                { name: "Admins", value: adminCount }
            ]);

            const claimsResponse = await axios.get(
                `${API_BASE_URL}/api/admin-dashboard/claims`,
                { headers: getAuthHeader() }
            );
            const fetchedClaims = Array.isArray(claimsResponse.data?.data) 
                ? claimsResponse.data.data 
                : (Array.isArray(claimsResponse.data) ? claimsResponse.data : []);

            const pendingCount = fetchedClaims.filter((c) => c.status_id === 1).length;
            const approvedCount = fetchedClaims.filter((c) => c.status_id === 2).length;
            const rejectedCount = fetchedClaims.filter((c) => c.status_id === 3).length;
            setClaimStats([
                { name: "Pending", value: pendingCount },
                { name: "Approved", value: approvedCount },
                { name: "Rejected", value: rejectedCount }
            ]);
        }
        catch (err) {
            console.error("Metric compilation failed: ", err);
            setErrorMessage("Unable to sync live data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardMetrics();
    }, []);

    const colours_users = ["#06b6d4", "#ef4444"]; 
    const colour_claims = ["#f59e0b", "#10b981", "#ef4444"];

    const customTooltipStyle = {
        backgroundColor: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "0.75rem",
        color: "#f4f4f5",
        fontFamily: "sans-serif"
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-zinc-950 text-zinc-100 font-sans">
            <Sidebar 
                user={user} 
                onLogout={onLogout} 
                isSidebarVisible={isSidebarVisible} 
                setSidebarVisible={setSidebarVisible} 
            />
            
            <div className="flex-1 p-6 md:p-12 overflow-y-auto relative">
               
                {!isSidebarVisible && (
                    <button
                        onClick={() => setSidebarVisible(true)}
                        className="hidden md:flex fixed top-6 left-6 z-40 text-zinc-400 hover:text-white p-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl transition"
                        title="Show Sidebar"
                    >
                        <Menu size={20} />
                    </button>
                )}
                
                <div className={`max-w-7xl mx-auto transition-all duration-300 ${!isSidebarVisible ? "md:pl-12" : ""}`}>
                    
                    <div className="mb-8 border-b border-zinc-800 pb-5">
                        <h1 className="text-2xl font-black tracking-tight text-white">
                            Dashboard
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">
                            Stats view for {" "}
                            <span className="text-cyan-400 font-medium">{user?.name}</span>
                        </p>
                    </div>

                    <div className="w-full">
                        
                        {errorMessage && (
                            <p className="text-red-500 mb-6 text-sm bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                                {errorMessage}
                            </p>
                        )}
                        {loading && (
                            <p className="text-cyan-500 mb-6 text-sm animate-pulse">
                                Compiling metric data...
                            </p>
                        )}
                        
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
                                <h2 className="text-base font-bold text-white tracking-tight mb-6 self-start">
                                    User role distribution
                                </h2>
                                <div className="w-full h-72 text-xs">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={userStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {userStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colours_users[index % colours_users.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={customTooltipStyle} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                           
                            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
                                <h2 className="text-base font-bold text-white tracking-tight mb-6 self-start">
                                    Claims status graph
                                </h2>
                                <div className="w-full h-72 text-xs">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={claimStats}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {claimStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colour_claims[index % colour_claims.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={customTooltipStyle} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;