import EmployeeDashboard from "../EmployeeDashboard";
import axios from 'axios';
import Select from "react-select";

import { getAuthHeader } from "../Utils/auth";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, options } from "../../assets/selectstyle";
import { convertToBase64 } from "../Utils/conversionBase64";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../../config/api";


const AddClaim = () => {
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [claimAmount, setClaimAmount] = useState(1000);
    const [file, setFile] = useState(null);
    const [fileScanned, setFileScanned] = useState(false);

    const navigate = useNavigate();
    const handleBack = () => navigate('/employee-dashboard');

    const scanReceipt = async (e) => {
        if (e) e.preventDefault();
        if (!file) {
            setErrorMessage("Please select a file first before scanning.");
            return;
        }
        setScanLoading(true);
        setErrorMessage("");
        try {
            const base64Data = await convertToBase64(file);
            const response = await axios.post(
                `${RECEIPTS_BASE_URL}/api/receipts/amountGemini`,
                { imageBuffer: base64Data }
            );
            if (response.data.isReceipt=== false) {
                setErrorMessage("The uploaded file is not recognized as a valid receipt.");
                return;
            }
            if (response.data && response.data.totalAmount !== undefined) {
                setClaimAmount(response.data.totalAmount);
                setFileScanned(true);
            } else {
                setErrorMessage("Could not parse amount from receipt response.");
            }
        } catch (err) {
            console.error(err);
            setErrorMessage("Failed to scan receipt.");
        } finally {
            setScanLoading(false);
        }
    };


    const addClaims = async (event) => {
        event.preventDefault();
        setLoading(true);
        setErrorMessage("");

        try {

            const response = await axios.post(
                `${API_BASE_URL}/api/employee-dashboard/claims`,
                {
                    category_id: categoryId,
                    description: description,
                    claim_amount: claimAmount,
                },
                {
                    headers: getAuthHeader(),
                },
            );

            console.log("Claim added successfully:", response.data);
            const claimId = response.data.data.id;
            console.log("Claim ID received from server:", claimId);

            if (!claimId) {
                throw new Error("Failed to retrieve claim ID from server.");
            }


            let base64File = "";
            if (file) {
                base64File = await convertToBase64(file);
            }


            const receiptResponse = await axios.post(
                `${RECEIPTS_BASE_URL}/api/receipts`,
                {
                    imageBuffer: base64File,
                    claim_id: Number(claimId),
                },
                {
                    headers: getAuthHeader(),
                }
            );


            if (response.data?.success || receiptResponse.status === 200) {
                setCategoryId("");
                setDescription("");
                setClaimAmount("");
                setFile(null);


                if (typeof fetchClaims === "function") await fetchClaims();
                handleBack();
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.message || "Unable to complete adding claim and uploading receipt.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
            <header className="max-w-8xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white">
                        Add Claim
                    </h1>
                </div>
                <button
                    onClick={handleBack}
                    className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold cursor-pointer tracking-wider uppercase border border-zinc-800 rounded-lg transition"
                >
                    Back
                </button>
            </header>

            {errorMessage && (
                <div className="max-w-8xl mx-auto mb-4 p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-lg">
                    {errorMessage}
                </div>
            )}

            {fileScanned && (
                <div className="max-w-8xl mx-auto mb-4 p-3 bg-emerald-500 border-b-emerald-700 text-emerald-200 font-bold rounded-lg">
                    File Scanned
                </div>
            )}

            <div
                className="items-center mb-6 flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
            >
                <div className="flex flex-col gap-3 w-full">
                    {fileScanned !== true && (
                        <label>Add Receipt</label>
                    )}
                    <div className="flex flex-row gap-5">
                        <input
                            type="file"
                            accept="image/*"
                            required
                            disabled={fileScanned}
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 file:cursor-pointer"
                        />
                        <button
                            type="button"
                            disabled={loading || fileScanned}
                            onClick={scanReceipt}
                            className="w-1/3 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 
                                        transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer
                                        disabled:bg-gray-500 disabled:border-b-gray-800 disabled:text-gray-200 disabled:cursor-not-allowed disabled:hover:bg-gray-500/40
                                        disabled:hover:border-gray-400/40"
                        >
                            {scanLoading ? "Scanning..." : "Scan Receipt"}
                        </button>
                    </div>
                </div>

            </div>

            {fileScanned === true && (
                <div
                    className="mb-6 flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
                >
                    <div id="addDetails" className="w-full flex flex-col gap-10 p-1">
                        <div className="w-full flex flex-row gap-5">
                            <div id="categoryDiv" className="flex flex-col gap-3 w-150">
                                <label>Category</label>
                                <Select
                                    options={options}
                                    styles={customSelectStyles}
                                    value={options.find((option) => option.value === categoryId)}
                                    onChange={(selectedOption) => setCategoryId(selectedOption.value)}
                                    placeholder="Select Category"
                                    menuPortalTarget={document.body}
                                    className="w-full"
                                />
                            </div>


                            <div id="amountDiv" className="flex flex-col gap-3 w-130">
                                <label>Claim Amount</label>
                                <input
                                    type="number"
                                    name="claim_amount"
                                    placeholder="Claim Amount"
                                    required
                                    value={claimAmount}
                                    onChange={(e) => setClaimAmount(e.target.value)}
                                    className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                                />
                            </div>

                        </div>

                        <div className="w-full flex flex-row gap-5">
                            <div className="flex flex-col gap-3 w-full">
                                <label>Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    placeholder="Description"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md"
                                />
                            </div>

                        </div>

                        <div className="flex flex-row gap-5 w-half">
                            <button
                                type="button"
                                onClick={addClaims}
                                disabled={loading}
                                className="w-35 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Adding..." : "Add"}
                            </button>
                            <button
                                type="button"
                                onClick={handleBack}
                                className="w-35 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
                            >
                                Back
                            </button>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddClaim;