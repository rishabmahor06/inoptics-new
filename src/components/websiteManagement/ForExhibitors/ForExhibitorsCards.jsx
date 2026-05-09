import React, { useEffect, useState } from "react";
import { useForExhibitorsStore } from "../../../store/website/useForExhibitorsStore";
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput,
  SectionHeader, TrRow, Td, TdId, TdHtml, TdActions,
} from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function ForExhibitorsCards() {
  const { cards, loadingCards, fetchCards, addCard, updateCard, deleteCard } = useForExhibitorsStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle]     = useState("");
  const [desc,  setDesc]      = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openAdd = () => {
    setEditing(null); setTitle(""); setDesc("");
    setModal("add");
  };
  const openEdit = (row) => {
    setEditing(row); setTitle(row.title || ""); setDesc(row.description || "");
    setModal("edit");
  };
  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", desc);
      if (modal === "edit") fd.append("id", editing.id);
      if (modal === "add") await addCard(fd);
      else                 await updateCard(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="For Exhibitors — Cards" count={cards.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      <WmTable headers={["#", "TITLE", "DESCRIPTION", "ACTIONS"]} loading={loadingCards} empty={cards.length === 0}>
        {cards.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{i + 1}</TdId>
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn  onClick={() => deleteCard(row.id)} />
            </TdActions>
          </TrRow>
        ))}
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
          </div>
        </WmModal>
      )}
    </div>
  );
}
