import { client } from "@/lib/supabase/client"
import { type Database } from "@/lib/supabase/database.types"
import { toastError } from "@/lib/toast"
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from "@supabase/supabase-js"
import { create } from "zustand"

type Page = Database["public"]["Tables"]["pages"]["Row"]

type Status = "start" | "success" | "failed" | null

type DocState = {
  saveStatus: Status
  failedSaveData: Partial<
    Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">
  >
  loadingDoc: boolean
  doc: Page | null
  isLocked: boolean
}

type DocAction = {
  setSaveStatus(status: Status): void
  getDocAsync(uuid: string): Promise<{ uuid: string; parent_uuid: string | null } | void>
  updateDocAsync(
    uuid: string,
    doc: Partial<Pick<Page, "content" | "description" | "emoji" | "image_url" | "title">>,
  ): Promise<void>
  docRealtimeHandler(opt: {
    eventType: `${REALTIME_POSTGRES_CHANGES_LISTEN_EVENT}`
    doc: Page
  }): void
  _updateDoc(doc: Page): void
  toggleLock: () => void
}

const initialState: DocState = {
  saveStatus: null,
  loadingDoc: true,
  doc: null,
  failedSaveData: {},
  isLocked: false,
}

export const useDocStore = create<DocState & DocAction>()((set, get) => ({
  ...initialState,
  async toggleLock() {
    const oldDoc = get().doc
    if (!oldDoc) return

    try {
      const { error } = await client
        .from("pages")
        .update({
          is_locked: !oldDoc.is_locked,
        })
        .eq("uuid", oldDoc.uuid)

      if (error) throw new Error(error.message)
      set({
        doc: { ...oldDoc, is_locked: !oldDoc.is_locked },
        isLocked: !oldDoc.is_locked,
      })
    } catch (error) {
      toastError({
        title: "Lock failed",
        description:
          "Something went wrong. Please check your internet connection & try again.",
      })
    }
  },
  setSaveStatus(status) {
    set({ saveStatus: status })
  },
  docRealtimeHandler({ eventType, doc }) {
    // permanently delete opened page, reset doc state
    if (eventType === "DELETE") return set({ ...initialState })
    if (eventType === "UPDATE") return get()._updateDoc(doc)
  },
  _updateDoc(doc) {
    const oldDoc = get().doc
    if (!oldDoc || oldDoc.uuid !== doc.uuid) return

    // Todo: handle CDRT, https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type
    console.log("update", doc)
    set({ doc })
  },
  async getDocAsync(uuid) {
    set({ ...initialState })

    try {
      const { data, error } = await client
        .from("pages")
        .select("*")
        .eq("uuid", uuid)
        .single()

      if (error) throw new Error(error.message)

      set({ loadingDoc: false, doc: data, isLocked: !!data.is_locked })
      return { uuid: data.uuid, parent_uuid: data.parent_uuid }
    } catch (error) {
      toastError({
        description: "Something went wrong. Broken link or poor internet connection.",
      })
    }
  },

  async updateDocAsync(uuid, doc) {
    try {
      set({
        saveStatus: "start",
        // optimistic update
        doc: {
          ...get().doc,
          ...(doc as Page),
        },
      })

      const { data, error } = await client
        .from("pages")
        .update({
          ...get().failedSaveData,
          ...doc,
        })
        .eq("uuid", uuid)
        .select("*")
        .single()

      if (error) throw new Error(error.message)

      set({
        loadingDoc: false,
        saveStatus: "success",
        failedSaveData: {},
      })
    } catch (error) {
      set({
        saveStatus: "failed",
        failedSaveData: { ...get().failedSaveData, ...doc },
      })
      toastError({
        title: "Save failed",
        description:
          "Something went wrong. Please check your internet connection & try again.",
      })
    }
  },
}))
