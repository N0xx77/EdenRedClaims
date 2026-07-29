import EmployeeDashboard from "../EmployeeDashboard";
import axios from 'axios';
import Select from "react-select";

import { getAuthHeader } from "../Utils/auth";
import { convertToBase64 } from "../Utils/conversionBase64";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { customSelectStyles, options } from "../../assets/selectstyle";
import { API_BASE_URL, RECEIPTS_BASE_URL } from "../../config/api";


const ClaimUpdate = () => {


  const navigate = useNavigate();

  const { claimID } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [alterClaimId, setAlterClaimId] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [claimAmount, setClaimAmount] = useState("");
  const [file, setFile] = useState(null);



  const fetchClaim = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/employee-dashboard/claims/${claimID}`);

      const data = response.data.data;
      setClaim(data);
      setCategoryId(data.category_id);
      setDescription(data.description);
      setClaimAmount(data.claim_amount);
    }
    catch (err) {
      console.error(err);
      setClaims(null);
      setErrorMessage("Unable to fetch claims.");
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaim();
  }, []);

  /* useEffect(() => {
    console.log("claim updated:", claim);
  }, [claim]);
  */
  const handleBack = () => navigate('/employee-dashboard')

  const updateClaims = async () => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/api/employee-dashboard/claims`,
        {
          claim_id: claimID,
          category_id: categoryId,
          description: description,
          claim_amount: claimAmount,
        },
        {
          headers: getAuthHeader(),
        },
      );

      if (!response.data?.success) {
        throw new Error("Claim update failed");
      }

      let receiptResponse = null;

      let base64File = '';
      if (file) {
        base64File = await convertToBase64(file);
        console.log(base64File);
        console.log(claimID);

        receiptResponse = await axios.patch(
          `${RECEIPTS_BASE_URL}/api/receipts`, {

          imageBuffer: base64File,
          claim_id: Number(claimID)
        }
        );
      }

      console.log('done')


      if (response.data?.success && (!file || receiptResponse.status === 200)) {
        setCategoryId("");
        setDescription("");
        setClaimAmount("");
        setFile(null);
        await fetchClaim();
        handleBack();
      }
      else {
        throw new Error("Couldn't update claim...");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to update claim...");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6 md:p-12">
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Update Claim: <span className="text-cyan-400">{claimID}</span>
          </h1>

        </div>
        <button
          onClick={handleBack}
          className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold tracking-wider uppercase border border-zinc-800 rounded-lg transition"
        >
          Back
        </button>
      </header>

      {errorMessage && (
        <div className="max-w-7xl mx-auto mb-4 p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-lg">
          {errorMessage}
        </div>
      )}

      <form
        className="mb-10 flex flex-col gap-4 rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="w-full flex flex-col gap-10 p-1">
          <div className="w-full flex flex-row gap-5">
            <div className="flex flex-col gap-3 w-full">
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

            <div className="flex flex-col gap-3 w-full">
              <label>Amount</label>
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

            <div className="flex flex-col gap-3 w-full">
              <label>Update Receipt</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full rounded-lg border border-blue-500/20 bg-blue-950/30 px-4 py-3 shadow-2xl shadow-blue-950/30 backdrop-blur-md file:mr-4 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-300 hover:file:bg-cyan-500/30 file:cursor-pointer"
              />
            </div>
          </div>
          <div>
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
              type="button" onClick={updateClaims}
              className="w-30 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
            >
              Update
            </button>
            <button
              type="button" onClick={handleBack}
              className="w-30 inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wide text-cyan-300 transition hover:border-cyan-400 hover:bg-cyan-500/20 hover:cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </form>

    </div>


  );
};

export default ClaimUpdate;



