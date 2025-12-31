"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { updateUserByGuid } from "../../services/viewUserService";
import { RemarkItem } from "../../../../../types/user";
import Toast from "../../../../../components/common/Toast";

const NotesSection = ({ userData }: { userData: any }) => {
  const initialNotes: RemarkItem[] = (userData?.remarks || [])
    .map((item: any) => ({
      text: item.remark,
      created_at: item.created_at,
      updated_at: item.updated_at || item.created_at,
    }))
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

  const [notes, setNotes] = useState<RemarkItem[]>(initialNotes);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const formatDate = (utcString: string) => {
    const date = new Date(utcString);
    return date.toLocaleString();
  };

  const saveRemarksToDB = async (list: RemarkItem[]) => {
    const form = new FormData();
    form.append("remarks_list", JSON.stringify(list));

    const response = await updateUserByGuid(userData.guid, form);

    const updatedRemarks: RemarkItem[] = (response.data.remarks || [])
      .map((item: any) => ({
        text: item.remark,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at,
      }))
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

    setNotes(updatedRemarks);
  };

  const handleAdd = async () => {
    if (!inputText.trim()) return;

    setLoading(true);

    try {
      const now = new Date().toISOString();

      const newNote: RemarkItem = {
        text: inputText,
        created_at: now,
        updated_at: now,
      };

      const newList = [newNote, ...notes];

      await saveRemarksToDB(newList);

      setInputText("");
      setToastType('success');
      setToastMessage('Note saved successfully');
      setShowToast(true);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error?.response?.data?.message || error?.message || 'Failed to save note');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (index: number) => {
    setEditIndex(index);
    setInputText(notes[index].text);
  };

  const handleUpdate = async () => {
    if (editIndex === null || !inputText.trim()) return;

    setLoading(true);

    try {
      const now = new Date().toISOString();

      const updatedList = notes.map((note, i) =>
        i === editIndex ? { ...note, text: inputText, updated_at: now } : note
      );

      await saveRemarksToDB(updatedList);

      setEditIndex(null);
      setInputText("");
      setToastType('success');
      setToastMessage('Note updated successfully');
      setShowToast(true);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error?.response?.data?.message || error?.message || 'Failed to update note');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (index: number) => {
    setLoading(true);

    try {
      const newList = notes.filter((_, i) => i !== index);

      await saveRemarksToDB(newList);

      setToastType('success');
      setToastMessage('Note deleted successfully');
      setShowToast(true);
    } catch (error: any) {
      setToastType('error');
      setToastMessage(error?.response?.data?.message || error?.message || 'Failed to delete note');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white p-5 rounded-2xl shadow-sm">
        <h3 className="text-lg lg:text-2xl font-semibold text-primaryText mb-4">
          Remarks
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {notes.length > 0 ? (
              notes.map((note, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-2xl flex justify-between items-start"
                >
                  <div>
                    <p className="text-sm text-gray-500">
                      {formatDate(note.updated_at)}
                    </p>
                    <p className="text-base font-medium text-primaryText mt-1 break-all">
                      {note.text}
                    </p>

                  </div>

                  <div className="flex gap-2">
                    <Pencil
                      className="text-green-600 w-4 h-4 cursor-pointer"
                      onClick={() => handleEditStart(index)}
                    />

                    <Trash2
                      className="text-red-600 w-4 h-4 cursor-pointer"
                      onClick={() => handleDelete(index)}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No notes added yet.</p>
            )}
          </div>

          {/* RIGHT SIDE — Add/Edit */}
          <div className="flex flex-col">
            <textarea
              placeholder={editIndex !== null ? "Edit Note" : "Add Internal Note"}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-40 border border-gray-200 rounded-2xl p-3 text-sm bg-gray-50
                focus:border-green-500 focus:ring-1 focus:ring-green-200"
            />

            <div className="flex justify-end mt-3">
              {editIndex !== null ? (
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm"
                >
                  {loading ? "Updating..." : "Update Note"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full text-sm"
                >
                  {loading ? "Saving..." : "Save Note"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Toast
        open={showToast}
        type={toastType}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
  </div>
  );
};

export default NotesSection;
