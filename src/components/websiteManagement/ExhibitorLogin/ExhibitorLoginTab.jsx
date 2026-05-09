import React, { useEffect, useState } from "react";
import { useExhibitorLoginContentStore } from "../../../store/website/useExhibitorLoginContentStore";
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field,
  SectionHeader, TrRow, TdId, TdHtml, TdActions,
} from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function ExhibitorLoginTab() {
  const { rows, loading, fetchRows, addRow, updateRow, deleteRow } = useExhibitorLoginContentStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [desc, setDesc]       = useState("");
  const [saving, setSaving]   = useState(false);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  const openAdd = () => { setEditing(null); setDesc(""); setModal("add"); };
  const openEdit = (row) => { setEditing(row); setDesc(row.description || ""); setModal("edit"); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("description", desc);
      if (modal === "edit") fd.append("id", editing.id);
      if (modal === "add") await addRow(fd);
      else                 await updateRow(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Exhibitor Login — Marketing Content" count={rows.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      <WmTable headers={["#", "DESCRIPTION", "ACTIONS"]} loading={loading} empty={rows.length === 0}>
        {rows.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{i + 1}</TdId>
            <TdHtml html={row.description} />
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn  onClick={() => deleteRow(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal title={modal === "add" ? "Add Content" : "Edit Content"} onClose={() => setModal(null)} onSave={handleSave} saving={saving}>
          <Field label="Description" required>
            <CustomEditor value={desc} onChange={setDesc} placeholder="Login page marketing copy..." />
          </Field>
        </WmModal>
      )}
    </div>
  );
}
