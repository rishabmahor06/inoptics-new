import React, { useEffect, useState } from "react";
import { useVisitorGuideStore } from "../../../store/website/useVisitorGuideStore";
import {
  AddBtn, EditBtn, DelBtn, WmModal, WmTable, Field, WmInput, WmFileInput,
  SectionHeader, TrRow, Td, TdId, TdImage, TdHtml, TdActions, imgSrc, ImgPreview,
} from "../shared/WmShared";
import CustomEditor from "../../CustomEditor/CustomEditor";

export default function VisitorGuideCards() {
  const { cards, loadingCards, fetchCards, addCard, updateCard, deleteCard } = useVisitorGuideStore();
  const [modal, setModal]     = useState(null);
  const [editing, setEditing] = useState(null);
  const [title, setTitle]     = useState("");
  const [desc,  setDesc]      = useState("");
  const [link,  setLink]      = useState("");
  const [file,  setFile]      = useState(null);
  const [saving, setSaving]   = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { fetchCards(); }, [fetchCards]);

  const openAdd = () => {
    setEditing(null); setTitle(""); setDesc(""); setLink(""); setFile(null);
    setModal("add");
  };
  const openEdit = (row) => {
    setEditing(row);
    setTitle(row.title || "");
    setDesc(row.description || "");
    setLink(row.link || row.url || "");
    setFile(null);
    setModal("edit");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", desc);
      fd.append("link", link);
      if (file) fd.append("image", file);
      if (modal === "edit") fd.append("id", editing.id);
      if (modal === "add") await addCard(fd);
      else                 await updateCard(fd);
      setModal(null);
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <SectionHeader title="Visitor Guide — Cards" count={cards.length}>
        <AddBtn onClick={openAdd} />
      </SectionHeader>

      <WmTable
        headers={["#", "IMAGE", "TITLE", "DESCRIPTION", "LINK", "ACTIONS"]}
        loading={loadingCards}
        empty={cards.length === 0}
      >
        {cards.map((row, i) => (
          <TrRow key={row.id} index={i}>
            <TdId>{i + 1}</TdId>
            <TdImage src={row.image || row.image_path} alt={row.title} onPreview={setPreview} />
            <Td className="font-semibold text-zinc-800">{row.title}</Td>
            <TdHtml html={row.description} />
            <Td>
              {(row.link || row.url) ? (
                <a href={row.link || row.url} target="_blank" rel="noreferrer" className="text-blue-600 text-[12px] truncate inline-block max-w-[180px]">
                  {row.link || row.url}
                </a>
              ) : <span className="text-zinc-300">—</span>}
            </Td>
            <TdActions>
              <EditBtn onClick={() => openEdit(row)} />
              <DelBtn  onClick={() => deleteCard(row.id)} />
            </TdActions>
          </TrRow>
        ))}
      </WmTable>

      {modal && (
        <WmModal
          title={modal === "add" ? "Add Card" : "Edit Card"}
          onClose={() => setModal(null)}
          onSave={handleSave}
          saving={saving}
        >
          <div className="space-y-4">
            <Field label="Title" required>
              <WmInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card title" />
            </Field>
            <Field label="Description">
              <CustomEditor value={desc} onChange={setDesc} placeholder="Card description..." />
            </Field>
            <Field label="Link (optional)">
              <WmInput value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
            </Field>
            {modal === "edit" && (editing?.image || editing?.image_path) && (
              <Field label="Current Image">
                <img
                  src={imgSrc(editing.image || editing.image_path)}
                  alt={title}
                  onClick={() => setPreview(imgSrc(editing.image || editing.image_path))}
                  className="h-20 w-32 object-cover rounded-lg border border-zinc-200 cursor-pointer hover:scale-105 transition-transform"
                />
              </Field>
            )}
            <Field label={modal === "edit" ? "Replace Image (optional)" : "Image"}>
              <WmFileInput onChange={(e) => setFile(e.target.files[0])} />
              {file && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={URL.createObjectURL(file)} alt="" className="h-16 w-24 object-cover rounded-lg border border-zinc-200" />
                  <p className="text-xs text-emerald-600">{file.name}</p>
                </div>
              )}
            </Field>
          </div>
        </WmModal>
      )}

      {preview && <ImgPreview src={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
