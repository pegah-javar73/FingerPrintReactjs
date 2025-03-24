import React, { useState } from "react";

function FingerprintCapture() {
  const [capturedFingerprint, setCapturedFingerprint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCapture = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:6001/capture");

      if (!response.ok) throw new Error("خطا در دریافت پاسخ از سرور");

      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        setCapturedFingerprint(jsonResponse.data); // base64 image
      } else {
        setError(jsonResponse.message || "خطا در عملیات");
      }
    } catch (error: any) {
      setError(error.message || "خطای نامشخص");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={handleCapture}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
        {loading ? "در حال گرفتن اثر انگشت..." : "گرفتن اثر انگشت"}
      </button>

      {error && <p className="text-red-500 mt-4">❗ {error}</p>}

      {capturedFingerprint && (
        <div className="mt-4">
          <h3 className="text-xl mb-2">اثر انگشت گرفته شده:</h3>
          <img
            src={`data:image/png;base64,${capturedFingerprint}`}
            alt="Fingerprint"
            className="border p-2"
          />
        </div>
      )}

  
    </div>
  );
}

export default FingerprintCapture;
