import React, { useState, useEffect } from 'react';
import DirectiveList from './DirectiveList';
import { intelligentTagApi } from '../services/intelligentTagApi';
import './WorldBuildingDirectivesTab.scss';

const WorldBuildingDirectivesTab = ({ tag, isExpanded, refreshKey, onRefresh }) => {
  const [worldBuildingDirectives, setWorldBuildingDirectives] = useState(null);
  const [directivesByType, setDirectivesByType] = useState({});
  const [activeTab, setActiveTab] = useState('character_generation');

  // Update active tab when relevant directive types change
  useEffect(() => {
    if (relevantDirectiveTypes.length > 0 && !relevantDirectiveTypes.find(type => type.key === activeTab)) {
      setActiveTab(relevantDirectiveTypes[0].key);
    }
  }, [relevantDirectiveTypes, activeTab]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingProgress, setStreamingProgress] = useState(null);

  const directiveTypes = [
    { key: 'character_generation', label: 'Character Generation', icon: '👤' },
    { key: 'character_evolution', label: 'Character Evolution', icon: '🔄' },
    { key: 'place_generation', label: 'Place Generation', icon: '🏛️' },
    { key: 'place_evolution', label: 'Place Evolution', icon: '🏗️' },
    { key: 'object_generation', label: 'Object Generation', icon: '⚔️' },
    { key: 'object_evolution', label: 'Object Evolution', icon: '🔧' },
    { key: 'arc_generation', label: 'Arc Generation', icon: '📈' },
    { key: 'arc_evolution', label: 'Arc Evolution', icon: '📊' },
    { key: 'past_events_generation', label: 'Past Events', icon: '📜' },
    { key: 'past_events_evolution', label: 'Past Events Evolution', icon: '📚' }
  ];

  // Get relevant directive types from the world building directives or streaming progress
  const getRelevantDirectiveTypes = () => {
    // First check if we have relevant areas from streaming progress
    if (streamingProgress && streamingProgress.relevantAreas && streamingProgress.relevantAreas.length > 0) {
      return directiveTypes.filter(type => streamingProgress.relevantAreas.includes(type.key));
    }
    
    // Then check if we have relevant areas from existing world building directives
    if (worldBuildingDirectives && worldBuildingDirectives.relevantAreas) {
      try {
        const relevantAreas = JSON.parse(worldBuildingDirectives.relevantAreas);
        return directiveTypes.filter(type => relevantAreas.includes(type.key));
      } catch (error) {
        console.error('Error parsing relevant areas:', error);
        return directiveTypes;
      }
    }
    
    // Default to all directive types if no relevant areas are available
    return directiveTypes;
  };

  const relevantDirectiveTypes = getRelevantDirectiveTypes();

  // Load world building directives when tag is accepted and expanded
  useEffect(() => {
    if (isExpanded && tag.suggestionId && tag.suggestionStatus === 'accepted' && !isLoading) {
      loadWorldBuildingDirectives();
    }
  }, [isExpanded, tag.suggestionId, tag.suggestionStatus]);

  // Reload world building directives when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0 && isExpanded && tag.suggestionId && tag.suggestionStatus === 'accepted') {
      loadWorldBuildingDirectives();
    }
  }, [refreshKey]);

  const loadWorldBuildingDirectives = async () => {
    if (!tag.suggestionId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await intelligentTagApi.getWorldBuildingDirectives(tag.suggestionId);
      
      if (response.data?.success && response.data.data) {
        setWorldBuildingDirectives(response.data.data);
        
        // Group directives by type
        const grouped = {};
        if (response.data.data.directives) {
          response.data.data.directives.forEach(directive => {
            if (!grouped[directive.directiveType]) {
              grouped[directive.directiveType] = [];
            }
            grouped[directive.directiveType].push(directive);
          });
        }
        setDirectivesByType(grouped);
      } else {
        // If no data is returned, clear the state to show the generate button
        setWorldBuildingDirectives(null);
        setDirectivesByType({});
      }
    } catch (error) {
      console.error('Error loading world building directives:', error);
      // If there's an error (like 404), clear the state to show the generate button
      setWorldBuildingDirectives(null);
      setDirectivesByType({});
      setError(null); // Don't show error for missing data
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateWorldBuildingDirectives = async () => {
    if (!tag.suggestionId) return;

    try {
      setIsLoading(true);
      setError(null);
      setStreamingProgress(null);
      
      // Use streaming API for better UX
      const eventSource = intelligentTagApi.generateWorldBuildingDirectivesStreaming(
        tag.suggestionId,
        // Progress callback
        (progress) => {
          setStreamingProgress(progress);
        },
        // Complete callback
        (data) => {
          setWorldBuildingDirectives(data);
          
          // Group directives by type
          const grouped = {};
          if (data.directives) {
            data.directives.forEach(directive => {
              if (!grouped[directive.directiveType]) {
                grouped[directive.directiveType] = [];
              }
              grouped[directive.directiveType].push(directive);
            });
          }
          setDirectivesByType(grouped);
          
          // Trigger refresh of other tabs (like Tag Directives tab)
          if (onRefresh) {
            onRefresh();
          }
          
          setIsLoading(false);
          setStreamingProgress(null);
        },
        // Error callback
        (error) => {
          console.error('Error generating world building directives:', error);
          setError('Error generating world building directives. Please try again.');
          setIsLoading(false);
          setStreamingProgress(null);
        }
      );
      
      // Return cleanup function
      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error('Error starting world building directives generation:', error);
      setError('Error starting world building directives generation. Please try again.');
      setIsLoading(false);
      setStreamingProgress(null);
    }
  };

  const handleUpdateDirective = async (suggestionId, directiveId, newDirective, newDirectiveAim) => {
    try {
      const response = await intelligentTagApi.updateDirective(suggestionId, directiveId, newDirective, newDirectiveAim);
      
      if (response.data?.success) {
        setDirectivesByType(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(type => {
            updated[type] = updated[type].map(d => 
              d.id === directiveId ? response.data.data : d
            );
          });
          return updated;
        });
        
        // Trigger refresh of other tabs
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Failed to update directive');
      }
    } catch (error) {
      console.error('Error updating directive:', error);
      throw error;
    }
  };

  const handleDeleteDirective = async (suggestionId, directiveId) => {
    try {
      const response = await intelligentTagApi.deleteDirective(suggestionId, directiveId);
      
      if (response.data?.success) {
        setDirectivesByType(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(type => {
            updated[type] = updated[type].filter(d => d.id !== directiveId);
          });
          return updated;
        });
        
        // Trigger refresh of other tabs
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Failed to delete directive');
      }
    } catch (error) {
      console.error('Error deleting directive:', error);
      throw error;
    }
  };

  const handleRegenerateDirective = async (suggestionId, directiveId) => {
    try {
      const response = await intelligentTagApi.regenerateDirective(suggestionId, directiveId);
      
      if (response.data?.success) {
        setDirectivesByType(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(type => {
            updated[type] = updated[type].map(d => 
              d.id === directiveId ? response.data.data : d
            );
          });
          return updated;
        });
        
        // Trigger refresh of other tabs
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Failed to regenerate directive');
      }
    } catch (error) {
      console.error('Error regenerating directive:', error);
      throw error;
    }
  };

  // Only render if tag is accepted and has suggestionId
  if (!tag.suggestionId || tag.suggestionStatus !== 'accepted') {
    return null;
  }

  return (
    <div className="world-building-directives-tab mt-3">
      <div className="world-building-header">
        <h4>World Building Directives</h4>
        {!worldBuildingDirectives && (
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleGenerateWorldBuildingDirectives}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate World Building Directives'}
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="streaming-overlay">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            {streamingProgress && (
              <div className="streaming-progress mt-3">
                <div className="progress mb-2">
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ width: `${streamingProgress.progress}%` }}
                    aria-valuenow={streamingProgress.progress} 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                  >
                    {streamingProgress.progress}%
                  </div>
                </div>
                <div className="progress-message">
                  <strong>{streamingProgress.stage}:</strong> {streamingProgress.message}
                </div>
                
                {/* Enhanced progress display */}
                {streamingProgress.phase && (
                  <div className="progress-details mt-2">
                    <div className="phase-indicator">
                      <span className={`phase-badge phase-${streamingProgress.phase}`}>
                        {streamingProgress.phase.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Show relevant areas when analysis is complete */}
                    {streamingProgress.phase === 'analysis' && streamingProgress.relevantAreas && (
                      <div className="relevant-areas mt-2">
                        <small className="text-muted">Relevant areas found:</small>
                        <div className="areas-list">
                          {streamingProgress.relevantAreas.map((area, index) => (
                            <span key={index} className="area-badge">
                              {area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Show current area being processed */}
                    {streamingProgress.phase === 'generation' && streamingProgress.currentArea && (
                      <div className="current-area mt-2">
                        <small className="text-muted">
                          Processing: {streamingProgress.currentAreaIndex} of {streamingProgress.totalAreas}
                        </small>
                        <div className="current-area-name">
                          {streamingProgress.currentArea.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {(worldBuildingDirectives || (streamingProgress && streamingProgress.relevantAreas && streamingProgress.relevantAreas.length > 0)) && (
        <div className="world-building-content">
          {/* Tab Navigation */}
          <ul className="nav nav-tabs" role="tablist">
            {relevantDirectiveTypes.map(type => (
              <li className="nav-item" key={type.key}>
                <button
                  className={`nav-link ${activeTab === type.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(type.key)}
                  type="button"
                >
                  <span className="tab-icon">{type.icon}</span>
                  <span className="tab-label">{type.label}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Tab Content */}
          <div className="tab-content">
            {relevantDirectiveTypes.map(type => (
              <div
                key={type.key}
                className={`tab-pane fade ${activeTab === type.key ? 'show active' : ''}`}
                role="tabpanel"
              >
                <div className="tab-pane-content">
                  {directivesByType[type.key] && directivesByType[type.key].length > 0 ? (
                    <DirectiveList
                      directives={directivesByType[type.key]}
                      suggestionId={tag.suggestionId}
                      onUpdateDirective={handleUpdateDirective}
                      onDeleteDirective={handleDeleteDirective}
                      onRegenerateDirective={handleRegenerateDirective}
                      isLoading={isLoading}
                    />
                  ) : (
                    <div className="no-directives">
                      <p>No {type.label.toLowerCase()} directives available.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorldBuildingDirectivesTab; 