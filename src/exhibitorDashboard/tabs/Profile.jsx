import React, { useEffect, useState } from "react";
import TabShell from "../TabShell";
import {
  MdPerson,
  MdEdit,
  MdClose,
  MdCheck,
  MdLanguage,
  MdBusiness,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdReceiptLong,
  MdStorefront,
  MdLock,
} from "react-icons/md";
import { useProfileStore } from "../store/useProfileStore";

export default function Profile() {
  const {
    exhibitors,
    stallList,
    products,
    brandsData,
    hasBrandsData,
    loading,
    saving,
    fetchAll,
    setBrandsData,
    submitBrands,
  } = useProfileStore();

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (!hasBrandsData && !loading) setIsEditMode(true);
  }, [hasBrandsData, loading]);

  const handleSubmit = async () => {
    const ok = await submitBrands();
    if (ok) setIsEditMode(false);
  };

  return (
    <TabShell
      title="Profile"
      Icon={MdPerson}
      subtitle="Your company, stall and brand details"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <PersonalDetailsCard exhibitors={exhibitors} loading={loading} />
          <StallDetailsCard stallList={stallList} loading={loading} />
        </div>
        <div>
          <BrandsCard
            brandsData={brandsData}
            setBrandsData={setBrandsData}
            products={products}
            hasBrandsData={hasBrandsData}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            onSubmit={handleSubmit}
            saving={saving}
            loading={loading}
          />
        </div>
      </div>
    </TabShell>
  );
}

function PersonalDetailsCard({ exhibitors, loading }) {
  return (
    <Card title="Personal Details" Icon={MdPerson}>
      {loading ? (
        <Skel rows={6} />
      ) : exhibitors.length === 0 ? (
        <Empty text="No exhibitor details found." />
      ) : (
        exhibitors.map((ex) => (
          <div
            key={ex.id}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3"
          >
            <Detail Icon={MdBusiness} label="Company Name" value={ex.company_name} />
            <Detail Icon={MdPerson} label="Name" value={ex.name} />
            <Detail Icon={MdLocationOn} label="Address" value={ex.address} full />
            <Detail label="City" value={ex.city} />
            <Detail label="State" value={ex.state} />
            <Detail label="Pincode" value={ex.pin} />
            <Detail Icon={MdPhone} label="Mobile No" value={ex.mobile} />
            <Detail Icon={MdEmail} label="Email" value={ex.email} />
            <Detail Icon={MdReceiptLong} label="GST" value={ex.gst} full />
          </div>
        ))
      )}
    </Card>
  );
}

function StallDetailsCard({ stallList, loading }) {
  return (
    <Card title="Stall Details" Icon={MdStorefront}>
      {loading ? (
        <Skel rows={3} />
      ) : stallList.length === 0 ? (
        <Empty text="No stall details found." />
      ) : (
        <div className="space-y-3">
          {stallList.map((stall, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100"
            >
              <Detail label="Stall Number" value={stall.stall_number} />
              <Detail
                label="Stall Price"
                value={
                  stall.stall_price
                    ? `${stall.currency || stallList?.[0]?.currency || "₹"} ${stall.stall_price}`
                    : null
                }
              />
              <Detail
                label="Stall Area"
                value={stall.stall_area ? `${stall.stall_area} sq. mtr.` : null}
              />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function BrandsCard({
  brandsData,
  setBrandsData,
  products,
  hasBrandsData,
  isEditMode,
  setIsEditMode,
  onSubmit,
  saving,
  loading,
}) {
  return (
    <Card
      title="Brands"
      Icon={MdLanguage}
      action={
        !isEditMode && hasBrandsData ? (
          <button
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
          >
            <MdEdit size={14} /> Edit
          </button>
        ) : null
      }
    >
      {loading ? (
        <Skel rows={5} />
      ) : isEditMode ? (
        <BrandsForm
          brandsData={brandsData}
          setBrandsData={setBrandsData}
          products={products}
          hasBrandsData={hasBrandsData}
          onCancel={() => setIsEditMode(false)}
          onSubmit={onSubmit}
          saving={saving}
        />
      ) : hasBrandsData ? (
        <BrandsView brandsData={brandsData} />
      ) : (
        <Empty text="No brand info yet." />
      )}
    </Card>
  );
}

function BrandsForm({
  brandsData,
  setBrandsData,
  products,
  hasBrandsData,
  onCancel,
  onSubmit,
  saving,
}) {
  const update = (key, val) => setBrandsData((p) => ({ ...p, [key]: val }));
  const addProduct = (val) => {
    if (!val) return;
    if ((brandsData.products || []).includes(val)) return;
    setBrandsData((p) => ({ ...p, products: [...(p.products || []), val] }));
  };
  const removeProduct = (val) =>
    setBrandsData((p) => ({
      ...p,
      products: (p.products || []).filter((x) => x !== val),
    }));

  return (
    <div className="space-y-4">
      <Field
        label="Website"
        value={brandsData.website}
        onChange={(v) => update("website", v)}
        placeholder="https://..."
      />

      <div>
        <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
          Products
        </label>
        {(brandsData.products || []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {brandsData.products.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full"
              >
                {p}
                <button
                  type="button"
                  onClick={() => removeProduct(p)}
                  className="text-blue-500 hover:text-red-600"
                  title="Remove"
                >
                  <MdClose size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
        <select
          value=""
          onChange={(e) => addProduct(e.target.value)}
          className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select Product --</option>
          {products.map((p, i) => (
            <option key={i} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Home Brands"
        value={brandsData.home_brands}
        onChange={(v) => update("home_brands", v)}
      />
      <Field
        label="Distributors"
        value={brandsData.distributors}
        onChange={(v) => update("distributors", v)}
      />
      <Field
        label="International Brands"
        value={brandsData.international_brands}
        onChange={(v) => update("international_brands", v)}
      />

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
        {hasBrandsData && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60"
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <MdCheck size={16} />
              {hasBrandsData ? "Update" : "Submit"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function BrandsView({ brandsData }) {
  return (
    <div className="space-y-3">
      <ViewRow label="Website" value={brandsData.website} link />
      <div>
        <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-1.5">
          Products
        </p>
        {brandsData.products?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {brandsData.products.map((p) => (
              <span
                key={p}
                className="inline-flex items-center px-2.5 py-1 text-[12px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-full"
              >
                {p}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-zinc-400">—</p>
        )}
      </div>
      <ViewRow label="Home Brands" value={brandsData.home_brands} />
      <ViewRow label="Distributors" value={brandsData.distributors} />
      <ViewRow
        label="International Brands"
        value={brandsData.international_brands}
      />
      <div className="flex items-center gap-1.5 mt-2 text-[11.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <MdLock size={13} />
        Saved — click edit to update
      </div>
    </div>
  );
}

function Card({ title, Icon, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon size={16} />
            </div>
          )}
          <h3 className="text-[14px] font-bold text-[#02062c]">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function Detail({ label, value, Icon, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-zinc-500 flex items-center gap-1">
        {Icon && <Icon size={11} />}
        {label}
      </p>
      <p className="text-[13.5px] text-zinc-800 font-medium mt-0.5 wrap-break-word">
        {value || <span className="text-zinc-300">N/A</span>}
      </p>
    </div>
  );
}

function ViewRow({ label, value, link }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-0.5">
        {label}
      </p>
      {value ? (
        link ? (
          <a
            href={value.startsWith("http") ? value : `https://${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-[13.5px] text-blue-600 hover:underline wrap-break-word"
          >
            {value}
          </a>
        ) : (
          <p className="text-[13.5px] text-zinc-800 wrap-break-word">{value}</p>
        )
      ) : (
        <p className="text-[13.5px] text-zinc-300">—</p>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-zinc-600 mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px] border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-[13px] text-zinc-400 py-6 text-center">{text}</p>;
}

function Skel({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="h-2.5 w-24 bg-zinc-100 rounded animate-pulse" />
          <div className="h-3.5 w-full bg-zinc-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
