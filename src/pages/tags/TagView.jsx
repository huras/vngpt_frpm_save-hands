import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { tagApi } from '../../services/tagApi';
import { BACKEND_CONFIG } from '../../config/backend';
import TagImagePopup from '../../components/TagImagePopup';

const TagView = () => {
  const { id } = useParams();
  const [tag, setTag] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagApi.getTag(id);
        setTag(response.data);
        // Fetch stories for this tag
        const storiesRes = await tagApi.getStoriesByTag(id);
        setStories(storiesRes);
      } catch (err) {
        setError('Failed to fetch tag.');
      } finally {
        setLoading(false);
      }
    };
    fetchTag();
  }, [id]);

  if (loading) return <div className="container py-4">Loading tag...</div>;
  if (error || !tag) return <div className="container py-4 text-danger">{error || 'Tag not found.'}</div>;

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        {tag.thumb_url && (
          <TagImagePopup tag={tag} position="right">
            <img
              src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)}
              alt={tag.title}
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 12, marginRight: 24 }}
            />
          </TagImagePopup>
        )}
        <div>
          <h2 className="mb-1">{tag.title}</h2>
          <p className="text-muted mb-2">{tag.short_description}</p>
          <Link to={`/tags/${tag.id}/edit`} className="btn btn-outline-secondary btn-sm">Edit Tag</Link>
        </div>
      </div>
      <h4>Stories with this tag</h4>
      {stories.length === 0 ? (
        <div className="text-muted">No stories found for this tag.</div>
      ) : (
        <ul className="list-group">
          {stories.map(story => (
            <li key={story.id} className="list-group-item d-flex justify-content-between align-items-center">
              <Link to={`/stories/${story.id}`}>{story.title}</Link>
              <span className="badge bg-primary">ID: {story.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagView; 