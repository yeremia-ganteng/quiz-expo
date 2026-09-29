'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';


type Question = {
  id: string;
  category: string;
  text: string;
  options: string;
  correctOption: string;
  order: number;
};

type FormState = {
  id?: string;
  category: string;
  text: string;
  options: string[];
  correctOption: string;
  order: number;
};

const EMPTY_FORM: FormState = {
  category: '',
  text: '',
  options: ['', '', ''],
  correctOption: '',
  order: 1,
};

export default function AdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);

  const loadQuestions = () => {
    fetch('/api/admin/questions')
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const openNewForm = () => setForm({ ...EMPTY_FORM });

  const openEditForm = (q: Question) => {
    setForm({
      id: q.id,
      category: q.category,
      text: q.text,
      options: JSON.parse(q.options),
      correctOption: q.correctOption,
      order: q.order,
    });
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.category || !form.text || form.options.some((o) => !o) || !form.correctOption) {
      alert('Mohon lengkapi semua bidang sebelum menyimpan.');
      return;
    }
    const payload = {
      category: form.category,
      text: form.text,
      options: form.options,
      correctOption: form.correctOption,
      order: form.order,
    };

    if (form.id) {
      await fetch(`/api/admin/questions/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    setForm(null);
    loadQuestions();
  };

const requestDelete = (q: Question) => setDeleteTarget(q);

const confirmDelete = async () => {
  if (!deleteTarget) return;
  await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: 'DELETE' });
  setDeleteTarget(null);
  loadQuestions();
};

  const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <div className="max-w-4xl mx-auto">
<div className="flex items-center justify-between mb-10">
  <div>
    <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">Panel Admin</p>
    <h1 className="text-3xl font-extrabold text-slate-900">Kelola Soal Kuis</h1>
  </div>
  <div className="flex items-center gap-3">
    <Link
      href="/dashboard"
      className="text-sm font-semibold text-slate-700 bg-white border border-gray-200 hover:bg-gray-50 px-5 py-2.5 rounded-xl transition"
    >
      Lihat Dashboard
    </Link>
    <button
      onClick={openNewForm}
      className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
    >
      Tambah Soal
    </button>
  </div>
</div>

        {loading ? (
          <p className="text-gray-400 text-sm">Memuat data...</p>
        ) : (
          Object.entries(grouped).map(([category, qs]) => (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {category}
                </h2>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {qs.length} soal
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {qs.map((q) => (
                  <div
                    key={q.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{q.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Jawaban benar:{' '}
                        <span className="font-semibold text-emerald-600">{q.correctOption}</span>
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditForm(q)}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Edit
                      </button>
<button
  onClick={() => requestDelete(q)}
  className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
>
  Hapus
</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {deleteTarget && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
      <div className="px-8 pt-8 pb-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
            <path d="M10 11v6M14 11v6" />
          </svg>
        </div>
        <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
          Konfirmasi Penghapusan
        </p>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus soal ini?</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          &ldquo;{deleteTarget.text}&rdquo; akan dihapus permanen beserta seluruh riwayat jawaban peserta terkait. Tindakan ini tidak bisa dibatalkan.
        </p>
      </div>

      <div className="flex gap-3 justify-end px-8 py-5 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => setDeleteTarget(null)}
          className="text-sm font-semibold text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Batal
        </button>
        <button
          onClick={confirmDelete}
          className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg transition"
        >
          Ya, Hapus Soal
        </button>
      </div>
    </div>
  </div>
)}

      {form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                {form.id ? 'Ubah Soal' : 'Soal Baru'}
              </p>
              <h3 className="text-xl font-bold text-slate-900">
                {form.id ? 'Edit Soal' : 'Tambah Soal Baru'}
              </h3>
            </div>

            <div className="px-8 py-6 max-h-[65vh] overflow-y-auto">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Contoh: Literasi Digital"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              />

              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pertanyaan</label>
              <textarea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={2}
                placeholder="Tulis pertanyaan di sini"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 mb-5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none"
              />

              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Pilihan Jawaban</label>
              <div className="flex flex-col gap-2 mb-5">
                {form.options.map((opt, i) => (
                  <input
                    key={i}
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...form.options];
                      newOptions[i] = e.target.value;
                      setForm({ ...form, options: newOptions });
                    }}
                    placeholder={`Pilihan ${i + 1}`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                ))}
              </div>

              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jawaban Benar</label>
              <select
                value={form.correctOption}
                onChange={(e) => setForm({ ...form, correctOption: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              >
                <option value="">Pilih jawaban benar</option>
                {form.options.filter((o) => o).map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end px-8 py-5 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setForm(null)}
                className="text-sm font-semibold text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2 rounded-lg transition"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}