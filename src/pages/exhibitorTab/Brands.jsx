import React, { useState } from 'react';
import { MdBrandingWatermark } from 'react-icons/md';

export default function Brands() {
  const [declarationUndertakingData, setDeclarationUndertakingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleDelete = async () => {
    try {
      setLoading(true);
      setMessage('');

      const res = await fetch(
        "https://inoptics.in/api/delete_exhibitor_declaration_undertaking.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setDeclarationUndertakingData([]); // clear state
        setMessage('Deleted successfully');
      } else {
        setMessage(data?.message || 'Delete failed');
      }
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
      <MdBrandingWatermark size={48} className="text-zinc-200" />

      <p className="text-sm">
        {declarationUndertakingData.length === 0
          ? "Brand details will appear here."
          : "Brand data loaded"}
      </p>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Declaration"}
      </button>

      {message && <p className="text-xs text-green-400">{message}</p>}
    </div>
  );
}