import React from 'react';
import StarRating from './StarRating';
import './StoryExpansionSuggestionCard.scss';

const StoryExpansionSuggestionCard = ({ suggestion, type, onAccept, onDelete }) => {
    const isAccepted = suggestion.isAccepted;
    
    const handleAccept = () => {
        onAccept(type, suggestion.id);
    };

    const handleDelete = () => {
        onDelete(type, suggestion.id);
    };

    const renderTypeSpecificBadges = () => {
        switch (type) {
            case 'arcs':
                return (
                    <div className="arc-details">
                        <span className="badge badge-info">{suggestion.arcType}</span>
                        <span className="badge badge-secondary">{suggestion.complexity}</span>
                        <span className="badge badge-warning">{suggestion.estimatedDuration}</span>
                    </div>
                );
            
            case 'characters':
                return (
                    <div className="character-details">
                        <span className="badge badge-info">{suggestion.characterType}</span>
                        {suggestion.archetype && (
                            <span className="badge badge-secondary">{suggestion.archetype}</span>
                        )}
                    </div>
                );
            
            case 'places':
                return (
                    <div className="place-details">
                        <span className="badge badge-info">{suggestion.placeType}</span>
                        <span className="badge badge-secondary">{suggestion.significance}</span>
                        {suggestion.atmosphere && (
                            <span className="badge badge-warning">{suggestion.atmosphere}</span>
                        )}
                    </div>
                );
            
            case 'organizations':
                return (
                    <div className="organization-details">
                        <span className="badge badge-info">{suggestion.organizationType}</span>
                        <span className="badge badge-secondary">{suggestion.alignment}</span>
                        <span className="badge badge-warning">{suggestion.storyRole}</span>
                    </div>
                );
            
            case 'objects':
                return (
                    <div className="object-details">
                        <span className="badge badge-info">{suggestion.objectType}</span>
                        <span className="badge badge-secondary">{suggestion.rarity}</span>
                        <span className="badge badge-warning">{suggestion.significance}</span>
                    </div>
                );
            
            default:
                return null;
        }
    };

    return (
        <div className={`suggestion-card ${isAccepted ? 'accepted' : ''}`}>
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
                    <p className="detailed-description">{suggestion.description}</p>
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

                {renderTypeSpecificBadges()}

                {suggestion.ratingComment && (
                    <div className="rating-comment">
                        <strong>Comment:</strong> {suggestion.ratingComment}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoryExpansionSuggestionCard; 