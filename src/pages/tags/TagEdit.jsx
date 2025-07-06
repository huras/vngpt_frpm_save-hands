import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tagApi } from '../../services/tagApi';
import { BACKEND_CONFIG } from '../../config/backend';

const TagEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tag, setTag] = useState(null);
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [thumbUrl, setThumbUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagApi.getTag(id);
        setTag(response.data);
        setTitle(response.data.title);
        setShortDescription(response.data.short_description || '');
        setThumbUrl(response.data.thumb_url || '');
      } catch (err) {
        setError('Failed to fetch tag.');
      } finally {
        setLoading(false);
      }
    };
    fetchTag();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await tagApi.updateTag(id, {
        title,
        short_description: shortDescription,
        thumb_url: thumbUrl
      });
      navigate(`/tags/${id}`);
    } catch (err) {
      setError('Failed to update tag.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container py-4">Loading tag...</div>;
  if (error || !tag) return <div className="container py-4 text-danger">{error || 'Tag not found.'}</div>;

  return (
    <div className="container py-4">
      <h2>Edit Tag</h2>
      <form onSubmit={handleSubmit} className="mt-4" style={{ maxWidth: 500 }}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Short Description</label>
          <textarea className="form-control" value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2} />
        </div>
        <div className="mb-3">
          <label className="form-label">Thumbnail URL</label>
          <input type="text" className="form-control" value={thumbUrl} onChange={e => setThumbUrl(e.target.value)} />
          {thumbUrl && <img src={BACKEND_CONFIG.getImageUrl(thumbUrl)} alt="thumb" style={{ width: 80, marginTop: 8, borderRadius: 8 }} />}
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default TagEdit; 