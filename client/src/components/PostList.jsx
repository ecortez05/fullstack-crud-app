import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import PostForm from "./PostForm.jsx";

export default function PostList() {
  const [data, setData] = useState({ posts: [], page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null); // a post, "new", or null
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const params = { page, limit: 6 };
    if (query) params.search = query;
    api.listPosts(params).then(setData).catch((e) => setError(e.message));
  }, [page, query]);

  useEffect(load, [load]);

  async function save(values) {
    if (editing === "new") await api.createPost(values);
    else await api.updatePost(editing._id, values);
    setEditing(null);
    load();
  }

  async function remove(post) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await api.deletePost(post._id);
      // if that was the last post on the page, go back one
      if (data.posts.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (e) {
      setError(e.message);
    }
  }

  function runSearch(e) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  if (editing) {
    return <PostForm initial={editing === "new" ? null : editing} onSave={save} onCancel={() => setEditing(null)} />;
  }

  return (
    <>
      <div className="toolbar">
        <form onSubmit={runSearch}>
          <input placeholder="Search posts" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <button onClick={() => setEditing("new")}>New post</button>
      </div>

      {error && <p className="error">{error}</p>}
      {data.posts.length === 0 && <p className="muted center">{query ? "No matches." : "No posts yet. Write your first one."}</p>}

      <div className="grid">
        {data.posts.map((p) => (
          <article key={p._id} className="panel">
            <h3>{p.title}</h3>
            <p className="body">{p.body}</p>
            <div className="tags">
              {p.tags.map((t) => <span key={t}>#{t}</span>)}
            </div>
            <div className="row">
              <small className="muted">{new Date(p.createdAt).toLocaleDateString()}</small>
              <span className="spacer" />
              <button className="ghost" onClick={() => setEditing(p)}>Edit</button>
              <button className="ghost danger" onClick={() => remove(p)}>Delete</button>
            </div>
          </article>
        ))}
      </div>

      {data.pages > 1 && (
        <div className="pager">
          <button className="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="muted">Page {data.page} of {data.pages}</span>
          <button className="ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
