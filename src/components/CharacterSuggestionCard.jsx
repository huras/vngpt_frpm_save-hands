import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { intelligentTagApi } from '../services/intelligentTagApi';
import { BACKEND_CONFIG } from '../config/backend';
import './CharacterSuggestionCard.scss';

const CharacterSuggestionCard = ({ suggestion, onAccept, onDelete }) => {
    const isAccepted = suggestion.isAccepted;
    const [sourceDirectives, setSourceDirectives] = useState([]);
    const [loadingDirectives, setLoadingDirectives] = useState(false);
    
    // Helper function to safely parse array fields that might be strings
    const parseArrayField = (field) => {
        if (Array.isArray(field)) {
            return field;
        }
        if (typeof field === 'string') {
            try {
                const parsed = JSON.parse(field);
                return Array.isArray(parsed) ? parsed : [field];
            } catch {
                return [field];
            }
        }
        return [];
    };

    // Load source directives when component mounts
    useEffect(() => {
        const loadSourceDirectives = async () => {
            const directiveIds = parseArrayField(suggestion.sourceDirectives);
            if (directiveIds.length === 0) return;

            setLoadingDirectives(true);
            try {
                // Fetch directives by IDs using the new API endpoint
                const response = await intelligentTagApi.getDirectivesByIds(directiveIds);
                
                if (response.data?.success) {
                    setSourceDirectives(response.data.data);
                } else {
                    console.error('Failed to load directives:', response.data?.error);
                    setSourceDirectives([]);
                }
            } catch (error) {
                console.error('Error loading source directives:', error);
                setSourceDirectives([]);
            } finally {
                setLoadingDirectives(false);
            }
        };

        loadSourceDirectives();
    }, [suggestion.sourceDirectives]);
    
    const handleAccept = () => {
        onAccept('characters', suggestion.id);
    };

    const handleDelete = () => {
        onDelete('characters', suggestion.id);
    };

    return (
        <div className={`character-suggestion-card ${isAccepted ? 'accepted' : ''}`}>
            <div className="suggestion-header">
                <h4>{suggestion.name}</h4>
                <div className="suggestion-actions">
                    {!isAccepted && (
                        <>
                            <button
                                onClick={handleAccept}
                                className="btn btn-success btn-sm"
                                title="Accept suggestion"
                            >
                                <i className="fas fa-check"></i>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger btn-sm"
                                title="Delete suggestion"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </>
                    )}
                    {isAccepted && (
                        <span className="badge badge-success">Accepted</span>
                    )}
                </div>
            </div>
            
            <div className="suggestion-content">
                <p className="description">{suggestion.high_level_description}</p>
                
				

                {suggestion.description && (
					<div className="field-section">
						<p>{suggestion.description}</p>
					</div>
                )}

                <div className="suggestion-meta">
                    <span className="confidence">
                        Confidence: {Math.round(suggestion.confidence * 100)}%
                    </span>
                    {suggestion.userRating && (
                        <div className="rating">
                            <StarRating rating={suggestion.userRating} readonly />
                        </div>
                    )}
                </div>

                <div className="character-details">
                    <div className="badge-row">
                        <span className="badge bg-info text-dark">{suggestion.characterType}</span>
                    </div>
                    {suggestion.archetype && (
                        <div className="badge-row">
                            <span className="badge bg-secondary">{suggestion.archetype}</span>
                        </div>
                    )}
                    {suggestion.personalityTraits && (
                        <div className="badge-row">
                            {parseArrayField(suggestion.personalityTraits).map((trait, index) => (
                                <span key={index} className="badge bg-warning text-dark">{trait}</span>
                            ))}
                        </div>
                    )}
                    {suggestion.background && (
                        <div className="field-section">
                            <strong>Background:</strong>
                            <p>{suggestion.background}</p>
                        </div>
                    )}
                    {suggestion.motivations && (
                        <div className="field-section">
                            <strong>Motivations:</strong>
                            <div className="badge-row">
                                {parseArrayField(suggestion.motivations).map((motivation, index) => (
                                    <span key={index} className="badge bg-primary">{motivation}</span>
                                ))}
                            </div>
                        </div>
                    )}
                    {suggestion.sourceDirectives && (
                        <div className="field-section">
                            <strong>Source Directives:</strong>
                            {loadingDirectives ? (
                                <div className="loading-directives">
                                    <i className="fas fa-spinner fa-spin"></i>
                                    <span>Loading directives...</span>
                                </div>
                            ) : sourceDirectives.length > 0 ? (
                                <div className="directives-list">
                                    {sourceDirectives.map((directive, index) => (
                                        <div key={directive.id || index} className="directive-item">
                                            <div className="directive-header">
                                                {directive.tagSuggestion?.tag?.thumb_url ? (
                                                    <img 
                                                        src={BACKEND_CONFIG.getImageUrl(directive.tagSuggestion.tag.thumb_url)} 
                                                        alt={directive.tagSuggestion.tag.title}
                                                        className="directive-tag-thumb"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="directive-tag-thumb-placeholder">
                                                        <span>{directive.tagSuggestion?.tag?.title?.charAt(0)?.toUpperCase() || 'T'}</span>
                                                    </div>
                                                )}
                                                <div className="directive-info">
                                                    <h5 className="directive-tag-title">
                                                        {directive.tagSuggestion?.tag?.title || `Tag ${index + 1}`}
                                                    </h5>
                                                    <div className="directive-aim field-section" title={"Aim"}>
                                                        <p>{directive.directive_aim}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="directive-content field-section" title={"Directive"}>
                                                <p>{directive.directive}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No source directives available</p>
                            )}
                        </div>
                    )}
                </div>

                {suggestion.ratingComment && (
                    <div className="rating-comment">
                        <strong>Comment:</strong> {suggestion.ratingComment}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CharacterSuggestionCard; 