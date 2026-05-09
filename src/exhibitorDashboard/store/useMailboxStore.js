import { create } from "zustand";
import toast from "react-hot-toast";
import { fetchExhibitorMails, markMailRead } from "../api/mailboxApi";

export const useMailboxStore = create((set, get) => ({
  mails: [],
  loading: false,
  selectedMail: null,

  fetchMails: async () => {
    set({ loading: true });
    try {
      const list = await fetchExhibitorMails();
      const sorted = [...list].sort((a, b) => {
        const da = new Date(a.sent_at || a.created_at || 0).getTime();
        const db = new Date(b.sent_at || b.created_at || 0).getTime();
        return db - da;
      });
      set({ mails: sorted });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mails");
      set({ mails: [] });
    } finally {
      set({ loading: false });
    }
  },

  selectMail: async (mail) => {
    if (!mail) {
      set({ selectedMail: null });
      return;
    }
    set({ selectedMail: mail });
    if (Number(mail.is_read) === 0 || mail.is_read === "0") {
      try {
        await markMailRead(mail.id);
        const mails = get().mails.map((m) =>
          m.id === mail.id ? { ...m, is_read: 1 } : m
        );
        set({
          mails,
          selectedMail: { ...mail, is_read: 1 },
        });
      } catch (err) {
        console.error(err);
      }
    }
  },

  clearSelected: () => set({ selectedMail: null }),
}));
