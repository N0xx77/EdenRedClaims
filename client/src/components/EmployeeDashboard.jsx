import React from "react";
import axios from "axios";
import Select from "react-select";

import { getAuthHeader } from './Utils/auth';
import { useState, useEffect } from "react";
import { customSelectStyles, options } from "../assets/selectstyle";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../config/api";



export default function EmployeeDashboard({ user, onLogout }) {
  const [claims, setClaims] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [approvedAmount, setApprovedAmount] = useState();
  const [balance, setBalance] = useState();

  const navigate = useNavigate();

  const fetchClaims = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/employee-dashboard/claims`,
        {
          headers: getAuthHeader(),
        },
      );

      setClaims(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setClaims([]);
      setErrorMessage("Unable to fetch claims.");
    } finally {
      setLoading(false);
    }
  }

  const removeClaim = async (claimIdToDelete) => {
    setLoading(true);
    setErrorMessage("");
    try {

      const currClaim = claims.find((claim) => claim.id === claimIdToDelete);

      if (!currClaim) {
        setErrorMessage('Claim not found...');
        return;
      }

      if (currClaim.status_id !== 1) {
        setErrorMessage('Unable to delete non pending claims');
        return;
      }

      let response = null;
      let receiptResponse = null;

      if (currClaim.status_id === 1) {
        response = await axios.delete(
          `${API_BASE_URL}/api/employee-dashboard/claims`,
          {
            headers: getAuthHeader(),
            data: { claim_id: claimIdToDelete },
          },
        );

        receiptResponse = await axios.delete(
          `${RECEIPTS_BASE_URL}/api/receipts`,
          {
            data: { claim_id: Number(claimIdToDelete) }
          }
        )
      }

      if (response.data?.success && receiptResponse.status === 200) {
        await fetchClaims();
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to delete claim...");
    } finally {
      setLoading(false);
    }
  }

  const fetchStatuses = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/status`
      );
      setStatuses(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch statuses.");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/category`
      );
      setCategories(Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch categories...");
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/employee-dashboard/userBalance/${user.userID}`
      );
      setBalance(response.data?.data?.balance);

    }
    catch (err) {
      console.error(err);
      setErrorMessage("Unable to fetch balance...")
    }
  }

  const getStatusName = (statusID) => {
    const status = statuses.find((s) => s.id === statusID);
    return status ? status.status_name : "Unknown";
  }

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.category_name : "Unknown";
  }

  const normalizeClaim = (claim) => ({
    claimID: claim.claimID ?? claim.claim_id ?? claim.id,
    userID: claim.userID ?? claim.user_id,
    categoryID: claim.categoryID ?? claim.category_id,
    claim_amount: Number(claim.claim_amount ?? 0),
    description: claim.description ?? "",
    statusID: claim.statusID ?? claim.status_id,
    submission_date: claim.submission_date ?? null,
    validation_date: claim.validation_date ?? null,
    approved_amount: claim.approved_amount ?? null,
  });

  const employeeClaims = claims
    .filter((claim) => (claim.userID ?? claim.user_id) === user.userID)
    .map(normalizeClaim);


  const handleEdit = (claimIDToUpdate) => {
    navigate(`/employee-dashboard/updateClaim/${claimIDToUpdate}`);
  }

  const handleAdd = () => {
    navigate('/employee-dashboard/addClaim');
  }

  const handleRefresh = async () => {
    await Promise.all([
        fetchClaims(),
        fetchBalance()
    ])
  }

  useEffect(() => {
    fetchClaims();
    fetchStatuses();
    fetchCategories();
    fetchBalance();
  }, []);



  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Employee Portal
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Welcome back,{" "}
            <span className="text-cyan-400 font-medium">{user.name}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold cursor-pointer tracking-wider uppercase border border-zinc-800 rounded-lg transition"
        >
          Sign Out
        </button>
      </header>

      {errorMessage && (
        <div className="max-w-7xl mx-auto mb-4 p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 bg-gradient-to-br from-blue-950/40 to-zinc-900/40 backdrop-blur-md border border-blue-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
            Available Limit
          </h2>
          <p className="text-xs text-zinc-500 mb-4">
            Remaining flexible reimbursement fund
          </p>

          <div className="text-4xl font-black text-cyan-400 tracking-tight">
            Rs. {Math.round(balance)}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/60 flex justify-between text-xs text-zinc-400">
            <span>Identity Token:</span>
            <span className="font-mono text-zinc-300">EMP-{user.userID}</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Claims History
            </h2>
            <div className="flex flex-row gap-3">
              <div
                onClick={handleRefresh} 
                className="p-0 w-9 h-8 inline-flex items-center justify-center rounded-lg border text-center border-lime-400/40 bg-lime-500 text-lg font-bold uppercase tracking-wide text-gray-900 transition hover:border-lime-400 hover:bg-lime-500/50 hover:cursor-pointer">
                <img className="w-6 h-6" src="/public/images/refresh.svg"/>
              </div>
              <button
                onClick={handleAdd}
                className="p-0 w-9 h-8 inline-flex items-center justify-center rounded-lg border text-center border-cyan-400/40 bg-cyan-400 text-lg font-bold uppercase tracking-wide text-gray-900 transition hover:border-cyan-400 hover:bg-cyan-500/50 hover:cursor-pointer"
              >
                +
              </button>
              <span className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full inline-flex font-medium items-center justify-center h-8.5">
                {employeeClaims.length} Total Submissions
              </span>
            </div>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-3 font-medium">Claim ID</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Approved Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-sm">
                {employeeClaims.map((claim) => {
                  const statusName = getStatusName(claim.statusID);

                  return (
                    <tr
                      key={claim.claimID}
                      className="group hover:bg-zinc-900/20 transition-colors"
                    >
                      <td className="py-4 font-mono font-medium text-zinc-400">
                        {claim.claimID}
                      </td>
                      <td className="py-4 text-zinc-300">
                        <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-400">
                          {getCategoryName(claim.categoryID)}
                        </span>
                      </td>
                      <td
                        className="py-4 text-zinc-400 max-w-xs truncate pr-4"
                        title={claim.description}
                      >
                        {claim.description}
                      </td>
                      <td className="py-4 font-bold text-white">
                        Rs.{claim.claim_amount.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide
                          ${claim.statusID === 1 ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : ""}
                          ${claim.statusID === 2 ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                          ${claim.statusID === 3 ? "bg-red-500/10 text-red-400 border border-red-500/20" : ""}
                          ${claim.statusID === 4 ? "bg-yellow-500/10 text-orange-400 border border-orange-500/20" : ""}

                        `}
                        >
                          {statusName}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-white">
                        {claim.approved_amount !== null ? `Rs.${claim.approved_amount.toFixed(2)}` : "-"}
                      </td>
                      <td className="py-4 text-right">
                        <div className="grid grid-cols-2 gap-1/6 justify-items-centre pl-2">
                          <div className={`w-6 h-6 flex justify-center items-center rounded-md ${claim.statusID !== 1 ? 
                            "bg-gray-400 cursor-not-allowed pointer-events-none"
                             : "bg-red-500  cursor-pointer" }`}
                             onClick={() => removeClaim(claim.claimID)}
                             >
                            <img
                              src="/public/images/trashIcon.svg"
                              alt="Delete"
                              className="w-5 h-5"
                            />
                          </div>
                          <div className={`w-6 h-6 flex justify-center items-center rounded-md ${claim.statusID !== 1 ? 
                            "bg-gray-400 cursor-not-allowed pointer-events-none"
                             : "bg-yellow-300  cursor-pointer" }`}
                          >
                            <img
                              src="/public/images/editIcon.svg"
                              alt="Edit"
                              className="w-5 h-5 cursor-pointer"
                              onClick={() => handleEdit(claim.claimID)}
                            />
                          </div>
                        </div>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {employeeClaims.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No reimbursement claims filed yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
