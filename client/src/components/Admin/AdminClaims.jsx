import React from "react";
import axios from "axios";
import Select from "react-select";

import { getAuthHeader } from "../Utils/auth";
import { useState, useEffect } from "react";
import { customSelectStyles, options } from "../../assets/selectstyle";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../../config/api";

const AdminClaims = ({ user, onLogout }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [claims, setClaims] = useState([]);
  const [categories, setCategories] = useState([]);
  const [receipt, setReceipt] = useState('');


  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin-dashboard/users`,
        {
          headers: getAuthHeader(),
        },
      );
      setUsers(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch Users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin-dashboard/claims`,
        {
          headers: getAuthHeader(),
        },
      );
      setClaims(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch Claims.");
      setClaims([]);
    } finally {
      setLoading(false);
    }

  };

  const fetchReceipt = async (idToFetch) => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (!idToFetch) {
        setErrorMessage('Invalid claim_id');
        return;
      }

      const response = await axios.get(
        `${RECEIPTS_BASE_URL}/api/receipts/${idToFetch}`
      );

      setReceipt(response.data.data.imageBuffer);
      setIsDialogOpen(true);

    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch receipt...");
      setReceipt('');
    } finally {
      setLoading(false);
    }
  }

  const updatebalance = async (currClaim, balanceInWait, prevStatus, updatedStatus) => {
    setLoading(true);
    setErrorMessage('');
    try {
      console.log(balanceInWait);
      const currUser = users.find((u) => u.id === currClaim.user_id);
      const prevBalance = currUser.balance;

      let newBalance = currUser.balance;
      let response = null;

      if (prevStatus === 1 && updatedStatus === 2) {
        newBalance = currUser.balance - balanceInWait;
        response = await axios.patch(
          `${API_BASE_URL}/api/admin-dashboard/users/balance`,
          {
            id: currUser.id,
            balance: newBalance,
          },
          {
            headers: getAuthHeader(),
          },
        );
      }
      else if (prevStatus === 2 && updatedStatus === 3) {
        newBalance = currUser.balance + balanceInWait;
        response = await axios.patch(
          `${API_BASE_URL}/api/admin-dashboard/users/balance`,
          {
            id: currUser.id,
            balance: newBalance,
          },
          {
            headers: getAuthHeader(),
          },
        );
      }
      else if (prevStatus === 3 && updatedStatus === 2) {
        newBalance = currUser.balance - balanceInWait;
        response = await axios.patch(
          `${API_BASE_URL}/api/admin-dashboard/users/balance`,
          {
            id: currUser.id,
            balance: newBalance,
          },
          {
            headers: getAuthHeader(),
          },
        );
      }

      if (response.data?.success) {
        console.log(`Balance for user Updated...\nPrevious Balance: ${prevBalance}\tUpdated Balance: ${newBalance}`);
      }
      else {
        console.log('Error to update balance...')
      }

    }
    catch (err) {
      console.error(err);
      setErrorMessage("Unable to update user Balance.");
    }
    finally {
      setLoading(false);
    }
  }

  const handleStatusUpdate = async (claimId, newStatus) => {
    setErrorMessage('');
    try {
      const selectedClaim = claims.find((claim) => claim.id === claimId);
      const prevStatus = selectedClaim.status_id;

      let response = null;
      const isMoreThanThreeHoursDiff = (timestamp) => {
      const targetDate = new Date(timestamp);
      const currentDate = new Date();
      const Difference = Math.abs(currentDate.getTime() - targetDate.getTime());
      const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000; 
      return Difference > THREE_HOURS_IN_MS;
      };
      const monthDiff = isMoreThanThreeHoursDiff(selectedClaim.submission_date);
      if ((prevStatus !== newStatus)&&(!monthDiff)) {
        console.log(monthDiff);
        response = await axios.patch(
          `${API_BASE_URL}/api/admin-dashboard/claims/`,
          {
            claim_id: claimId,
            status_id: newStatus,
          },
          {
            headers: getAuthHeader(),
          },
        );
      }
      else{
        if(monthDiff){
          setErrorMessage("You cannot update the status of a claim that was submitted more than 3 hours ago.");
        }
        else{
          setErrorMessage("Cannot update claim to the same status.");
        }
        return;
      }

      if (response.data?.success) {
        console.log(`Claim ${claimId} status updated to: ${newStatus}`);
        const updatedStatus = newStatus;
        const balanceInWait = selectedClaim.claim_amount;
        await updatebalance(selectedClaim, balanceInWait, prevStatus, updatedStatus);
        fetchClaims();

      }

    } catch (err) {
      console.error(err);
      setErrorMessage(`Failed to update claim to ${newStatus}.`);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/category`);
      setCategories(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch categories.");
      setCategories([]);
    }
    
  };

  useEffect(() => {
    fetchUsers();
    fetchClaims();
    fetchCategories();
  }, []);

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

        <div className={`w-full transition-all duration-300 ${!isSidebarVisible ? "md:pl-12" : ""}`}>
          <header className="w-full flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Claims Management
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Welcome back,{" "}
                <span className="text-cyan-400 font-medium">{user?.name}</span>
              </p>
            </div>
          </header>

          <div className="w-full bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white tracking-tight">
                Claims
              </h2>
              <div className="flex flex-row gap-3">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full inline-flex font-medium items-center justify-center h-8.5">
                  {claims.length} Total Requests
                </span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-red-500 mb-4 text-sm">{errorMessage}</p>
            )}
            {loading && !isDialogOpen && (
              <p className="text-cyan-500 mb-4 text-sm">
                Loading dashboard data...
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Claim ID</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">User</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Category</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Description</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Amount</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Status</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Submission Date</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Actions</th>
                    <th className="pb-3 text-center whitespace-nowrap px-4 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-sm">
                  {claims.map((claim) => (
                    <tr
                      key={claim.id}
                      className="border-b border-zinc-800 hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-4 px-4 text-center font-mono font-medium text-zinc-400">
                        {claim.id}
                      </td>
                      <td className="py-4 px-4 text-center text-zinc-300 whitespace-nowrap">
                        {users.find((user) => user.id === claim.user_id)?.name || 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-center text-zinc-400">
                        {categories.find((cat) => cat.id === claim.category_id)?.category_name || 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-center max-w-xs truncate text-zinc-400" title={claim.description}>
                        {claim.description}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-white whitespace-nowrap">
                        Rs. {claim.claim_amount}
                      </td>
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide border ${claim.status_id === 2
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : claim.status_id === 3
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                        >
                          {claim.status_id === 1
                            ? "Pending"
                            : claim.status_id === 2
                              ? "Approved"
                              : "Rejected"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-zinc-400 whitespace-nowrap">
                        {claim.submission_date
                          ? new Date(claim.submission_date).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center items-center gap-2 min-w-[150px]">
                          {(claim.status_id === 1 || claim.status_id === 3) && (
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 2)}
                              className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg cursor-pointer bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-lg shadow-emerald-950/20 transition-all duration-200 ease-in-out active:scale-95"
                            >
                              Approve
                            </button>
                          )}
                          {(claim.status_id === 1 || claim.status_id === 2) && (
                            <button
                              onClick={() => handleStatusUpdate(claim.id, 3)}
                              className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg cursor-pointer bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-lg shadow-rose-950/20 transition-all duration-200 ease-in-out active:scale-95"
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => fetchReceipt(claim.id)}
                          className="px-3 py-1.5 text-xs font-semibold tracking-wide rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 hover:border-zinc-600 transition-all duration-200 ease-in-out active:scale-95"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-zinc-950 w-screen h-screen flex flex-col relative p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Receipt Document Viewer
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsDialogOpen(false);
                  setReceipt('');
                }}
                className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider border border-zinc-800 rounded-lg transition flex items-center gap-2"
              >
                <span>✕</span> Close Viewer
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 shadow-inner">
              {receipt ? (
                <img
                  src={receipt.startsWith('data:') ? receipt : `data:image/jpeg;base64,${receipt}`}
                  alt="Claim Receipt"
                  className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl border border-zinc-800"
                />
              ) : (
                <p className="text-zinc-500 text-sm">No preview image available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClaims;