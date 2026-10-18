import { useState } from "react";

export default function PostForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [body, setBody] = useState(initial?.body || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      await onSave({ title, body, tags: tagList });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form className="panel" onSubmit={submit}>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required />
      <textarea placeholder="Write something…" rows={5} value={body} onChange={(e) => setBody(e.target.value)} required />
      <input placeholder="Tags, separated by commas" value={tags} onChange={(e) => setTags(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <div className="row">
        <button disabled={saving}>{initial ? "Save changes" : "Publish"}</button>
        <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
