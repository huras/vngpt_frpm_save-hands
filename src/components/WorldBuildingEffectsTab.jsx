import React, { useState } from 'react';
import './WorldBuildingEffectsTab.scss';

const WorldBuildingEffectsTab = ({ 
  tag, 
  results = null, 
  storyId = null, 
  onWorldBuildingEffectsGenerated = null,
  storyTitle = null,
  storyBrainstorm = null
}) => {
  const [isGeneratingWorldBuildingEffects, setIsGeneratingWorldBuildingEffects] = useState(false);
  const [worldBuildingEffects, setWorldBuildingEffects] = useState(null);
  const [worldBuildingEffectsError, setWorldBuildingEffectsError] = useState(null);

  const handleGenerateWorldBuildingEffects = async () => {
    if (!tag.id || isGeneratingWorldBuildingEffects) return;

    try {
      setIsGeneratingWorldBuildingEffects(true);
      setWorldBuildingEffectsError(null);
      
      const { comprehensiveTagApi } = require('../services/comprehensiveTagApi');
      const response = await comprehensiveTagApi.generateWorldBuildingEffectsForTag(
        tag.id, 
        storyTitle || 'Story Title',
        storyBrainstorm || 'Story Brainstorm',
        storyId
      );
      
      if (response.data?.success) {
        setWorldBuildingEffects(response.data.data.worldBuildingEffects);
        if (onWorldBuildingEffectsGenerated) {
          onWorldBuildingEffectsGenerated(tag.id, response.data.data.worldBuildingEffects);
        }
      } else {
        setWorldBuildingEffectsError('Failed to generate world-building effects');
      }
    } catch (error) {
      console.error('Error generating world-building effects:', error);
      setWorldBuildingEffectsError('Error generating world-building effects. Please try again.');
    } finally {
      setIsGeneratingWorldBuildingEffects(false);
    }
  };

  const tagEffects = worldBuildingEffects || results?.worldBuildingEffects?.find(effects => effects.tagId === tag.id);
  const isTagAccepted = tag.suggestionStatus === 'accepted';

  const getImpactLevelColor = (level) => {
    switch (level) {
      case 'minor': return '#28a745';
      case 'moderate': return '#ffc107';
      case 'major': return '#fd7e14';
      case 'transformative': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getEffectTypeIcon = (type) => {
    switch (type) {
      case 'setting': return 'fas fa-map-marker-alt';
      case 'character': return 'fas fa-user';
      case 'plot': return 'fas fa-route';
      case 'atmosphere': return 'fas fa-cloud';
      case 'theme': return 'fas fa-lightbulb';
      case 'conflict': return 'fas fa-exclamation-triangle';
      case 'resolution': return 'fas fa-check-circle';
      case 'pacing': return 'fas fa-tachometer-alt';
      case 'audience_engagement': return 'fas fa-users';
      case 'cultural_impact': return 'fas fa-globe';
      default: return 'fas fa-star';
    }
  };

  return (
    <div className="world-building-effects mt-3">
      {tagEffects && tagEffects.effects && tagEffects.effects.length > 0 && (
        <div className="effects-list">
          {tagEffects.effects.map((effect, index) => (
            <div key={index} className="effect-item">
              <div className="effect-header">
                <i className={`${getEffectTypeIcon(effect.effectType)} effect-icon`}></i>
                <h6 className="effect-title">{effect.title}</h6>
                <span 
                  className="impact-level"
                  style={{ backgroundColor: getImpactLevelColor(effect.impactLevel) }}
                >
                  {effect.impactLevel}
                </span>
              </div>
              
              <p className="effect-description">{effect.description}</p>
              
              {effect.storyElements && effect.storyElements.length > 0 && (
                <div className="effect-details">
                  <strong>Affects:</strong>
                  <ul>
                    {effect.storyElements.map((element, i) => (
                      <li key={i}>{element}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {effect.examples && effect.examples.length > 0 && (
                <div className="effect-details">
                  <strong>Examples:</strong>
                  <ul>
                    {effect.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {effect.conflicts && effect.conflicts.length > 0 && (
                <div className="effect-details">
                  <strong>Potential Conflicts:</strong>
                  <ul>
                    {effect.conflicts.map((conflict, i) => (
                      <li key={i}>{conflict}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {effect.developmentOpportunities && effect.developmentOpportunities.length > 0 && (
                <div className="effect-details">
                  <strong>Development Opportunities:</strong>
                  <ul>
                    {effect.developmentOpportunities.map((opportunity, i) => (
                      <li key={i}>{opportunity}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {effect.audienceAppeal && (
                <div className="effect-details">
                  <strong>Audience Appeal:</strong>
                  <p>{effect.audienceAppeal}</p>
                </div>
              )}
              
              {effect.synergies && effect.synergies.length > 0 && (
                <div className="effect-details">
                  <strong>Synergistic Tags:</strong>
                  <ul>
                    {effect.synergies.map((synergy, i) => (
                      <li key={i}>{synergy}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {worldBuildingEffectsError && (
        <div className="world-building-effects-error">
          <i className="fas fa-exclamation-triangle"></i>
          <span>{worldBuildingEffectsError}</span>
        </div>
      )}
      
      {isGeneratingWorldBuildingEffects && (
        <div className="generating-effects">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Generating world-building effects for "{tag.title}"...</span>
        </div>
      )}
      
      {isTagAccepted && !tagEffects && !isGeneratingWorldBuildingEffects && !worldBuildingEffectsError && (
        <div className="generate-world-building-effects">
          <button
            onClick={handleGenerateWorldBuildingEffects}
            className="btn btn-sm btn-outline-success"
            disabled={isGeneratingWorldBuildingEffects}
          >
            <i className="fas fa-magic"></i>
            Generate World-Building Effects
          </button>
          <p className="generate-hint">Click to analyze how this tag affects your story's world-building</p>
        </div>
      )}
      
      {tagEffects && (!tagEffects.effects || tagEffects.effects.length === 0) && !isGeneratingWorldBuildingEffects && (
        <div className="no-world-building-effects">
          <i className="fas fa-info-circle"></i>
          <span>No world-building effects generated by the AI</span>
        </div>
      )}
    </div>
  );
};

export default WorldBuildingEffectsTab; 