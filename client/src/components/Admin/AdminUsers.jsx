import React, { useState, useEffect } from "react";
import axios from "axios";

import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAuthHeader } from "../Utils/auth";
import { customSelectStyles, options } from "../../assets/selectstyle";
import Sidebar from "./Sidebar";
import { API_BASE_URL } from "../../config/api";

const AdminUsers = ({ user, onLogout }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [companies, setCompanies] = useState([]);
  

  const fetchUser = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin-dashboard/users`,
        {
          headers: getAuthHeader()
        }
      );

      setUsers(Array.isArray(response.data?.data) ? response.data.data : []);
    }
    catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch Users.")
      setUsers([]);
    }
    finally {
      setLoading(false);
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/company`);
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setCompanies(data);

    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch company.");
      setCategories([]);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchCompanies();
    
  }, []);

  const navigate = useNavigate();

  const handleEdit = (userToUpdate) => {
    navigate(`/admin-dashboard/users/updateUser/${userToUpdate}`);
  }

  const handleCreate = () => {
    navigate('/admin-dashboard/users/createUser');
  }

  return (

    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar
        user={user}
        onLogout={onLogout}
        isSidebarVisible={isSidebarVisible}
        setSidebarVisible={setSidebarVisible}
      />


      <div className="flex-1 h-full p-6 md:p-12 overflow-y-auto relative">
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
          <header className="max-w-11/12 mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Users Management
              </h1>
            </div>
          </header>

          <div className="max-w-11/12 mx-auto lg:col-span-2 bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Users
              </h2>
              <div className="flex flex-row gap-3">
                <button
                  onClick={handleCreate}
                  className="p-0 w-9 h-8 inline-flex items-center justify-center rounded-lg border text-center border-cyan-400/40 bg-cyan-400 text-lg font-bold uppercase tracking-wide text-gray-900 transition hover:border-cyan-400 hover:bg-cyan-500/50 hover:cursor-pointer"
                >
                  +
                </button>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full inline-flex font-medium items-center justify-center h-8.5">
                  {users.length} Total Users
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 mb-4 text-sm">{errorMessage}</p>
            )}
            {loading && (
              <p className="text-cyan-500 mb-4 text-sm">
                Loading users data...
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 font-medium">User ID</th>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Email ID</th>
                    <th className="pb-3 font-medium">Company</th>
                    <th className="pb-3 font-medium">Balance</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right pr-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {users.map((u) => {
                    return (
                      <tr
                        key={u.user_id || u.id}
                        className="group hover:bg-zinc-900/20 transition-colors"
                      >
                        <td className="py-4 font-mono font-medium text-zinc-400">
                          {u.id}
                        </td>
                        <td
                          className="py-4 text-zinc-400 max-w-xs truncate pr-4"
                          title={u.name}
                        >
                          {u.name}
                        </td>
                        <td
                          className="py-4 text-zinc-400 max-w-xs truncate pr-4"
                          title={u.email_id}
                        >
                          {u.email_id}
                        </td>
                        <td
                          className="py-4 text-zinc-400 max-w-xs truncate pr-4"
                          title={companies.find((comp) => comp.id === u.company_id)?.company_name ?? ""}
                        >
                          {companies.find((comp) => comp.id === u.company_id)?.company_name ?? ""}
                        </td>
                        <td className="py-4 font-bold text-white">
                          Rs.{(u.balance === null) ? 0 : u.balance.toFixed(2)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide
                              ${u.user_type === "employee" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                              ${u.user_type === "admin" ? "bg-red-500/10 text-red-400 border border-red-500/20" : ""}
                            `}
                          >
                            {u.user_type}
                          </span>
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide
                              ${u.status === "active" ? "bg-lime-500/10 text-lime-400 border border-lime-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}
                            `}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-4">
                          <div className="flex justify-end pl-2">
                            <div className={`w-6 h-6 flex justify-center items-center rounded-md
                              ${user.userID === u.id
                                ? "bg-gray-500 cursor-not-allowed pointer-events-none"
                                : "bg-yellow-500 cursor-pointer"
                              }`}
                            >
                              <img
                                src="/public/images/editIcon.svg"
                                alt="Edit"
                                className="w-5 h-5 cursor-pointer"
                                onClick={() => handleEdit(u.id)}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && !loading && (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  No users exist...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;