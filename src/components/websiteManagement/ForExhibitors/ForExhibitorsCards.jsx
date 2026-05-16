import React, { useEffect, useState } from "react";
import { useForExhibitorsStore } from "../../../store/website/useForExhibitorsStore";
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";
import { MdToggleOn, MdToggleOff } from "react-icons/md";

export default function ForExhibitorsCards() {
  const { cards, loadingCards, fetchCards, addCard, updateCard, deleteCard } = useForExhibitorsStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle]     = useState("");
  const [desc,  setDesc]      = useState("");
  const [active, setActive]   = useState(false);
  const [saving, setSaving]   = useState(false);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const isActiveRow = (row) => {
    const v = row?.status ?? row?.active ?? row?.is_active;
    if (v === undefined || v === null) return false;
    const s = String(v).toLowerCase();
    return s === "1" || s === "true" || s === "active" || s === "yes";
  };

  const openAdd = () => {
    setEditing(null); setTitle(""); setDesc(""); setActive(false);
    setModal("add");
  };
  const openEdit = (row) => {
    setEditing(row);
    setTitle(row.title || "");
    setDesc(row.description || "");
    setActive(isActiveRow(row));
    setModal("edit");
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title,
        description: desc,
        status: active ? "active" : "inactive",
        ...(modal === "edit" ? { id: editing.id } : {}),
      };
      if (modal === "add") await addCard(payload);
      else                 await updateCard(payload);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="For Exhibitors — Cards" count={cards.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      <WmTable headers={["ID", "TITLE", "DESCRIPTION", "STATUS", "ACTIONS"]} loading={loadingCards} empty={cards.length === 0}>
        {cards.map((row, i) => {
          const act = isActiveRow(row);
          return (
            <TrRow key={row.id} index={i}>
              <TdId>{i + 1}</TdId>
              <Td className="font-semibold text-zinc-800">{row.title}</Td>
              <TdHtml html={row.description} />
              <Td>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${act ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded ${act ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                  {act ? 'Active' : 'Inactive'}
                </span>
              </Td>
              <TdActions>
                <EditBtn onClick={() => openEdit(row)} />
                <DelBtn  onClick={() => deleteCard(row.id)} />
              </TdActions>
            </TrRow>
          );
        })}
      </WmTable>

      {modal && (
        <WmModal title={modal === "add" ? "Add Card" : "Edit Card"} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <div className="space-y-4">
            <Field label="Title" required>
              <WmInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={desc} onChange={setDesc} placeholder="Card description..." />
            </Field>
            <Field label="Status">
              <button
                type="button"
                onClick={() => setActive((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded border text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                }`}
              >
                {active ? <MdToggleOn size={24} /> : <MdToggleOff size={24} />}
                {active ? 'Active' : 'Inactive'}
              </button>
              <p className="text-[11px] text-zinc-400 mt-1">
                {active
                  ? 'This card will be visible on the website.'
                  : 'This card will be hidden from the website.'}
              </p>
            </Field>
          </div>
        </WmModal>
      )}
    </div>
  );
}
