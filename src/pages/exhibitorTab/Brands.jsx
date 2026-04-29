import React, { useEffect } from "react";
import {
  MdBrandingWatermark, MdSave, MdClose, MdVisibility, MdLanguage,
} from "react-icons/md";
import { useNavStore } from "../../store/useNavStore";
import { useProductsStore }       from "../../store/master/useProductsStore";
import { useExhibitorBrandsStore } from "../../store/exhibitor/useExhibitorBrandsStore";

export default function Brands() {
  const { editingExhibitor: ex } = useNavStore();

  /* live products from masters */
  const products      = useProductsStore((s) => s.rows);
  const fetchProducts = useProductsStore((s) => s.fetch);

  const {
    data, isEdit, saving,
    initForCompany, setField, addProduct, removeProduct, submit,
  } = useExhibitorBrandsStore();

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { if (ex) initForCompany(ex); }, [ex, initForCompany]);

  if (!ex) return null;

  const handleSave = (e) => {
    e?.preventDefault?.();
    submit(ex);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ============= LEFT: PREVIEW ============= */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center shrink-0">
            <MdVisibility size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">Brands Preview</h3>
            <p className="text-[12px] text-zinc-400">Saved values</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          <PreviewField label="Website" value={data.website} link />
          <PreviewProducts products={data.products} />
          <PreviewField label="Home Brands"            value={data.home_brands} />
          <PreviewField label="Distributors of Brands" value={data.distributors} />
          <PreviewField label="International Brands"   value={data.international_brands} />
        </div>
      </div>

      {/* ============= RIGHT: FORM ============= */}
      <form onSubmit={handleSave} className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded bg-zinc-900 flex items-center justify-center shrink-0">
            <MdBrandingWatermark size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-zinc-900 leading-tight">
              {isEdit ? "Edit Brands" : "Add Brands"}
            </h3>
            <p className="text-[12px] text-zinc-400">{ex.company_name}</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 space-y-4">
          {/* Website */}
          <Field label="Website">
            <Input
              type="text"
              placeholder="https://example.com"
              value={data.website}
              onChange={(v) => setField("website", v)}
            />
          </Field>

          {/* Products */}
          <Field label="Products">
            {data.products.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {data.products.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2 py-1 text-[12px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 rounded"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removeProduct(p)}
                      className="ml-0.5 w-4 h-4 rounded hover:bg-blue-100 flex items-center justify-center text-blue-500 hover:text-blue-700"
                      title="Remove"
                    >
                      <MdClose size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <select
              value=""
              onChange={(e) => { addProduct(e.target.value); e.target.value = ""; }}
              className="w-full px-3 h-10 text-[14px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select Product —</option>
              {products
                .filter((p) => !data.products.includes(p.name))
                .map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
            </select>
            {products.length === 0 && (
              <p className="text-[11px] text-zinc-400 mt-1">
                No products in master. Add some in Masters → Products.
              </p>
            )}
          </Field>

          {/* Home Brands */}
          <Field label="Home Brands">
            <Input
              value={data.home_brands}
              onChange={(v) => setField("home_brands", v)}
              placeholder="Brand A, Brand B"
            />
          </Field>

          {/* Distributors */}
          <Field label="Distributors of Brands">
            <Input
              value={data.distributors}
              onChange={(v) => setField("distributors", v)}
              placeholder="Distributor names"
            />
          </Field>

          {/* International Brands */}
          <Field label="International Brands">
            <Input
              value={data.international_brands}
              onChange={(v) => setField("international_brands", v)}
              placeholder="Brand A, Brand B"
            />
          </Field>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              type="submit"
              disabled={saving}
              className="px-4 h-10 text-[13px] font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <MdSave size={16} />
              {saving ? "Saving..." : isEdit ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ================= sub-components ================= */

function PreviewField({ label, value, link }) {
  const trimmed = String(value || "").trim();
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      <div className="px-3 py-2 min-h-10 text-[14px] bg-zinc-50 border border-zinc-200 rounded text-zinc-800 wrap-break-word">
        {trimmed ? (
          link ? (
            <a
              href={trimmed.startsWith("http") ? trimmed : `https://${trimmed}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 underline"
            >
              <MdLanguage size={14} /> {trimmed}
            </a>
          ) : (
            <span>{trimmed}</span>
          )
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </div>
    </div>
  );
}

function PreviewProducts({ products }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Products</label>
      {products.length === 0 ? (
        <div className="px-3 py-2 min-h-10 text-[14px] bg-zinc-50 border border-zinc-200 rounded text-zinc-300">
          —
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded">
          {products.map((p) => (
            <span
              key={p}
              className="inline-flex items-center px-2 py-0.5 text-[12px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded"
            >
              {p}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }) {
  return (
    <input
      type={type}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 h-10 text-[14px] border border-zinc-200 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}
