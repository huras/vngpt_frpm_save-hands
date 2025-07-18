import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagApi } from '../../services/tagApi';
import { BACKEND_CONFIG } from '../../config/backend';
import TagImagePopup from '../../components/TagImagePopup';
import './TagList.scss';

const TagList = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tagApi.getTags({ perPage: 100 });
        setTags(response.data.data);
      } catch (err) {
        setError('Failed to fetch tags.');
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

  return (
    <div className="tag-list-page container">
      <h1 className="mb-4">Tags</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Loading tags...</div>
      ) : (
        <div className="row g-3">
          {tags.map(tag => (
            <div className="col-md-4 col-lg-3" key={tag.id}>
              <div className="card tag-card h-100">
                {tag.thumb_url && (
                  <TagImagePopup tag={tag} position="top">
                    <img
                      src={BACKEND_CONFIG.getImageUrl(tag.thumb_url)}
                      alt={tag.title}
                      className="card-img-top tag-thumb-img"
                    />
                  </TagImagePopup>
                )}
                <div className="card-body">
                  <h5 className="card-title">{tag.title}</h5>
                  <p className="card-text text-muted small">{tag.short_description}</p>
                  <div className="d-flex gap-2 mt-2">
                    <Link to={`/tags/${tag.id}`} className="btn btn-outline-primary btn-sm">View</Link>
                    <Link to={`/tags/${tag.id}/edit`} className="btn btn-outline-secondary btn-sm">Edit</Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagList; 