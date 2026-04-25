import React, { useEffect, useState } from "react";
import {
  MdPersonAdd,
  MdDelete,
  MdMail,
  MdBusiness,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdSearch,
} from "react-icons/md";

export default function NewExhibitorRequest() {
  const [newExhibitors, setNewExhibitors] = useState([]);
  const [loadingNewExhibitors, setLoadingNewExhibitors] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNewExhibitorData();
  }, []);

  const fetchNewExhibitorData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_new_exhibitors.php");

      const data = await res.json();

      if (data.status === "success") {
        setNewExhibitors([...(data.data || [])].sort((a, b) =>
          (a.company_name || a.person_name || '').localeCompare(b.company_name || b.person_name || '')
        ));
      } else {
        setNewExhibitors([]);
      }
    } catch (error) {
      console.error("Failed to load exhibitors", error);
      setNewExhibitors([]);
    } finally {
      setLoadingNewExhibitors(false);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exhibitor?"))
      return;

    try {
      const response = await fetch(
        "https://inoptics.in/api/delete_new_exhibitors.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        setNewExhibitors((prev) => prev.filter((item) => item.id !== id));
        alert("Deleted successfully");
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const handleMailClick = (item) => {
    alert(`Send mail to: ${item.email}`);
  };

  if (loadingNewExhibitors) {
    return (
      <div className="bg-white rounded-xl shadow-sm py-16 flex flex-col items-center gap-3">
        <MdPersonAdd size={46} className="text-zinc-300 animate-pulse" />
        <p className="text-sm text-zinc-500">Loading requests...</p>
      </div>
    );
  }

  const filteredExhibitors = newExhibitors.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.company_name?.toLowerCase().includes(q) ||
      item.person_name?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.mobile?.toLowerCase().includes(q)
    );
  });

  if (!newExhibitors.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm py-16 flex flex-col items-center gap-3">
        <MdPersonAdd size={46} className="text-zinc-300" />
        <p className="text-sm text-zinc-500">No exhibitor requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 px-2 py-2 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
       

        {/* Search */}
        <div className="relative w-full lg:w-80">
          <MdSearch
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, person, email..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
        {newExhibitors.map((item, index) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition"
          >
            {/* Card Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center">
                  <MdBusiness size={18} className="text-zinc-700" />
                </div>

                <div>
                  <p className="text-xs text-zinc-400 font-medium">
                    Request #{index + 1}
                  </p>
                  <h3 className="text-sm font-bold text-zinc-900 line-clamp-1">
                    {item.company_name}
                  </h3>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3 text-sm">
              <Info label="Person Name" value={item.person_name} />
              <Info label="Email" value={item.email} />
              <Info label="Mobile" value={item.mobile} />
              <Info label="GST" value={item.gst} />
              <Info label="Booth Space" value={item.booth_space} />
              <Info label="Space Type" value={item.space_type} />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Address
                </p>
                <p className="text-zinc-700 leading-6">
                  {item.address}, {item.city}, {item.state}, {item.country} -{" "}
                  {item.pincode}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Selected Products
                </p>

                <p className="text-zinc-700 leading-6">
                  {Array.isArray(item.selected_products)
                    ? item.selected_products.join(", ")
                    : item.selected_products || "-"}
                </p>
              </div>

              <Info label="Manual Product" value={item.manual_product} />

              <Info label="Brands" value={item.brands} />
              <Info label="Home Brands" value={item.home_brands} />

              <Info label="Submitted" value={item.submitted_at} />
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button
                onClick={() => handleMailClick(item)}
                className="flex-1 h-10 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 transition flex items-center justify-center gap-2"
              >
                <MdMail size={18} />
                Confirm Mail
              </button>

              <button
                onClick={() => handleDeleteClick(item.id)}
                className="w-10 h-10 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center justify-center"
              >
                <MdDelete size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Small reusable row */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
        {label}
      </p>
      <p className="text-zinc-800 wrap-break-word">{value || "-"}</p>
    </div>
  );
}
