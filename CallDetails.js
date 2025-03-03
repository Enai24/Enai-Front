// src/pages/CallDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCallById } from "../services/api"; // Ensure this function fetches call details
import { FaArrowLeft, FaPhoneAlt, FaMicrophoneSlash, FaRegEdit } from "react-icons/fa";

const CallDetails = () => {
  const { id } = useParams(); // Get the call ID from URL
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCallDetails = async () => {
      try {
        const data = await fetchCallById(id);
        setCall(data);
      } catch (err) {
        setError("Failed to load call details.");
      } finally {
        setLoading(false);
      }
    };

    getCallDetails();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-white">Loading call details...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-gray-900 text-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">📞 Call Details</h2>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white">
          <FaArrowLeft /> Back to Calls
        </button>
      </div>

      {/* Call Information */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <p className="text-gray-400">📱 Phone Number</p>
            <p className="text-lg font-semibold">{call.phone_number}</p>

            <p className="text-gray-400 mt-4">📌 Status</p>
            <p className={`text-lg font-semibold ${
              call.status === "Success" ? "text-green-400" : 
              call.status === "Pending" ? "text-yellow-400" : "text-red-400"
            }`}>
              {call.status}
            </p>

            <p className="text-gray-400 mt-4">🔹Call ID</p>
            <p className="text-gray-300">{call.blandAiCallId || "—"}</p>

            <p className="text-gray-400 mt-4">📅 Task</p>
            <p className="text-gray-300">{call.task || "—"}</p>

            <p className="text-gray-400 mt-4">🕒 Start Time</p>
            <p className="text-gray-300">{call.start_time || "—"}</p>
          </div>

          {/* Right Column */}
          <div>
            <p className="text-gray-400">🎙 Voice</p>
            <p className="text-gray-300">{call.voice || "—"}</p>

            <p className="text-gray-400 mt-4">🌍 Language</p>
            <p className="text-gray-300">{call.language || "—"}</p>

            <p className="text-gray-400 mt-4">⏳ Timezone</p>
            <p className="text-gray-300">{call.timezone || "—"}</p>

            <p className="text-gray-400 mt-4">🎤 Audio Recording</p>
            {call.audio_url ? (
              <audio controls className="w-full mt-2">
                <source src={call.audio_url} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            ) : (
              <p className="text-red-400 flex items-center gap-2">
                <FaMicrophoneSlash /> No audio recording available.
              </p>
            )}

            <p className="text-gray-400 mt-4">📜 Transcript</p>
            <p className="text-gray-300">{call.transcript || "No transcript available."}</p>
          </div>
        </div>
      </div>

      {/* Analysis Details Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-6">
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">📊 Analysis</h3>
        {call.analysis ? (
          <div className="overflow-x-auto">
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm text-gray-800 dark:text-gray-200">
              {JSON.stringify(call.analysis, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-yellow-400">Pending Analysis</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
          <FaRegEdit /> Edit Call
        </button>
        <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg flex items-center gap-2">
          <FaPhoneAlt /> Analyze Call
        </button>
        <button onClick={() => navigate(-1)} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
          Back to Calls
        </button>
      </div>
    </div>
  );
};

export default CallDetails;