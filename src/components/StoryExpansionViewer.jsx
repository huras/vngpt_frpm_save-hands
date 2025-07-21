import React, { useState, useEffect } from 'react';
import { storyExpansionApi } from '../services/storyExpansionApi';
import StoryExpansionSuggestionCard from './StoryExpansionSuggestionCard';
import './StoryExpansionViewer.scss';

const StoryExpansionViewer = ({ storyId }) => {
    const [expansionData, setExpansionData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('arcs');
    const [isGeneratingCharacter, setIsGeneratingCharacter] = useState(false);

    useEffect(() => {
        if (storyId) {
            loadStoryExpansion();
        }
    }, [storyId]);

    const loadStoryExpansion = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await storyExpansionApi.getStoryExpansion(storyId);
            setExpansionData(response.data.data);
        } catch (err) {
            console.error('Error loading story expansion:', err);
            setError('Failed to load story expansion data.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateExpansion = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            const response = await storyExpansionApi.generateStoryExpansion(storyId);
            setExpansionData(response.data.data);
        } catch (err) {
            console.error('Error generating story expansion:', err);
            setError(err.response?.data?.error || 'Failed to generate story expansion.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateCharacter = async () => {
        try {
            setIsGeneratingCharacter(true);
            setError(null);
            const response = await storyExpansionApi.generateCharacterSuggestion(storyId);
            
            // Reload the story expansion data to include the new character
            await loadStoryExpansion();
        } catch (err) {
            console.error('Error generating character suggestion:', err);
            setError(err.response?.data?.error || 'Failed to generate character suggestion.');
        } finally {
            setIsGeneratingCharacter(false);
        }
    };

    const handleAcceptSuggestion = async (type, id, rating = {}) => {
        try {
            const apiMethod = {
                arcs: storyExpansionApi.acceptArcSuggestion,
                characters: storyExpansionApi.acceptCharacterSuggestion,
                places: storyExpansionApi.acceptPlaceSuggestion,
                organizations: storyExpansionApi.acceptOrganizationSuggestion,
                objects: storyExpansionApi.acceptObjectSuggestion
            }[type];

            if (!apiMethod) {
                throw new Error(`Unknown suggestion type: ${type}`);
            }

            await apiMethod(id, rating);
            await loadStoryExpansion(); // Reload to get updated data
        } catch (err) {
            console.error(`Error accepting ${type} suggestion:`, err);
            setError(`Failed to accept ${type} suggestion.`);
        }
    };

    const handleDeleteSuggestion = async (type, id) => {
        if (!window.confirm('Are you sure you want to delete this suggestion?')) {
            return;
        }

        try {
            const apiMethod = {
                arcs: storyExpansionApi.deleteArcSuggestion,
                characters: storyExpansionApi.deleteCharacterSuggestion,
                places: storyExpansionApi.deletePlaceSuggestion,
                organizations: storyExpansionApi.deleteOrganizationSuggestion,
                objects: storyExpansionApi.deleteObjectSuggestion
            }[type];

            if (!apiMethod) {
                throw new Error(`Unknown suggestion type: ${type}`);
            }

            await apiMethod(id);
            await loadStoryExpansion(); // Reload to get updated data
        } catch (err) {
            console.error(`Error deleting ${type} suggestion:`, err);
            setError(`Failed to delete ${type} suggestion.`);
        }
    };

    const renderTabContent = () => {
        if (!expansionData) return null;

        const tabData = {
            arcs: expansionData.arcSuggestions || [],
            characters: expansionData.characterSuggestions || [],
            places: expansionData.placeSuggestions || [],
            organizations: expansionData.organizationSuggestions || [],
            objects: expansionData.objectSuggestions || []
        };

        const suggestions = tabData[activeTab];
        const typeLabels = {
            arcs: 'Story Arcs',
            characters: 'Characters',
            places: 'Places',
            organizations: 'Organizations',
            objects: 'Notable Objects'
        };

        return (
            <div className="tab-content">
                <div className="tab-header">
                    <h3>{typeLabels[activeTab]} ({suggestions.length})</h3>
                    {activeTab === 'characters' && (
                        <button
                            onClick={handleGenerateCharacter}
                            disabled={isGeneratingCharacter}
                            className="btn btn-outline-primary btn-sm"
                            title="Generate a new character suggestion"
                        >
                            {isGeneratingCharacter ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-plus"></i>
                                    Add Character
                                </>
                            )}
                        </button>
                    )}
                </div>
                
                {suggestions.length === 0 ? (
                    <div className="no-suggestions">
                        <p>No {activeTab} suggestions found.</p>
                        {activeTab === 'characters' && (
                            <button
                                onClick={handleGenerateCharacter}
                                disabled={isGeneratingCharacter}
                                className="btn btn-primary"
                            >
                                {isGeneratingCharacter ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Generating Character...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-user-plus"></i>
                                        Generate First Character
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="suggestions-grid">
                        {suggestions.map(suggestion => (
                            <StoryExpansionSuggestionCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                type={activeTab}
                                onAccept={handleAcceptSuggestion}
                                onDelete={handleDeleteSuggestion}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="story-expansion-viewer">
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading story expansion...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="story-expansion-viewer">
            <div className="expansion-header">
                <h2>Story Expansion</h2>
                <div className="expansion-actions">
                    {!expansionData && (
                        <button
                            onClick={handleGenerateExpansion}
                            disabled={isGenerating}
                            className="btn btn-primary"
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic"></i>
                                    Generate Story Expansion
                                </>
                            )}
                        </button>
                    )}
                    {expansionData && (
                        <button
                            onClick={handleGenerateExpansion}
                            disabled={isGenerating}
                            className="btn btn-outline-primary"
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sync-alt"></i>
                                    Regenerate
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle"></i>
                    {error}
                </div>
            )}

            {expansionData && (
                <>
                    <div className="expansion-stats">
                        <div className="stat">
                            <span className="stat-number">{expansionData.directivesCount || 0}</span>
                            <span className="stat-label">Directives Used</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                {(expansionData.arcSuggestions?.length || 0) +
                                 (expansionData.characterSuggestions?.length || 0) +
                                 (expansionData.placeSuggestions?.length || 0) +
                                 (expansionData.organizationSuggestions?.length || 0) +
                                 (expansionData.objectSuggestions?.length || 0)}
                            </span>
                            <span className="stat-label">Total Suggestions</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">
                                {(expansionData.arcSuggestions?.filter(s => s.isAccepted)?.length || 0) +
                                 (expansionData.characterSuggestions?.filter(s => s.isAccepted)?.length || 0) +
                                 (expansionData.placeSuggestions?.filter(s => s.isAccepted)?.length || 0) +
                                 (expansionData.organizationSuggestions?.filter(s => s.isAccepted)?.length || 0) +
                                 (expansionData.objectSuggestions?.filter(s => s.isAccepted)?.length || 0)}
                            </span>
                            <span className="stat-label">Accepted</span>
                        </div>
                    </div>

                    <div className="expansion-tabs">
                        <div className="tab-navigation">
                            <button
                                className={`tab-button ${activeTab === 'arcs' ? 'active' : ''}`}
                                onClick={() => setActiveTab('arcs')}
                            >
                                <i className="fas fa-route"></i>
                                Story Arcs
                                <span className="tab-count">{expansionData.arcSuggestions?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'characters' ? 'active' : ''}`}
                                onClick={() => setActiveTab('characters')}
                            >
                                <i className="fas fa-user"></i>
                                Characters
                                <span className="tab-count">{expansionData.characterSuggestions?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'places' ? 'active' : ''}`}
                                onClick={() => setActiveTab('places')}
                            >
                                <i className="fas fa-map-marker-alt"></i>
                                Places
                                <span className="tab-count">{expansionData.placeSuggestions?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'organizations' ? 'active' : ''}`}
                                onClick={() => setActiveTab('organizations')}
                            >
                                <i className="fas fa-building"></i>
                                Organizations
                                <span className="tab-count">{expansionData.organizationSuggestions?.length || 0}</span>
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'objects' ? 'active' : ''}`}
                                onClick={() => setActiveTab('objects')}
                            >
                                <i className="fas fa-gem"></i>
                                Objects
                                <span className="tab-count">{expansionData.objectSuggestions?.length || 0}</span>
                            </button>
                        </div>

                        {renderTabContent()}
                    </div>
                </>
            )}

            {!expansionData && !isLoading && (
                <div className="no-expansion">
                    <div className="no-expansion-content">
                        <i className="fas fa-lightbulb"></i>
                        <h3>Ready to Expand Your Story?</h3>
                        <p>
                            Generate story expansion suggestions based on your accepted tag directives. 
                            This will create arcs, characters, places, organizations, and objects that 
                            build upon your story's established themes and directions.
                        </p>
                        <button
                            onClick={handleGenerateExpansion}
                            disabled={isGenerating}
                            className="btn btn-primary btn-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Generating Story Expansion...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-magic"></i>
                                    Generate Story Expansion
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryExpansionViewer; 