import React, { useState, useEffect } from 'react';
import DirectiveList from './DirectiveList';
import { intelligentTagApi } from '../services/intelligentTagApi';
import './TagDirectivesTab.scss';

const TagDirectivesTab = ({ tag, isExpanded, refreshKey, onRefresh }) => {
  const [directives, setDirectives] = useState([]);
  const [directiveError, setDirectiveError] = useState(null);
  const [isLoadingDirectives, setIsLoadingDirectives] = useState(false);

  // Load directives when tag is accepted and expanded
  useEffect(() => {
    if (isExpanded && tag.suggestionId && tag.suggestionStatus === 'accepted' && !isLoadingDirectives) {
      loadDirectives();
    }
  }, [isExpanded, tag.suggestionId, tag.suggestionStatus]);

  // Reload directives when refreshKey changes (triggered by world building directives generation)
  useEffect(() => {
    if (refreshKey > 0 && isExpanded && tag.suggestionId && tag.suggestionStatus === 'accepted') {
      loadDirectives();
    }
  }, [refreshKey]);

  const loadDirectives = async () => {
    if (!tag.suggestionId) return;

    try {
      setIsLoadingDirectives(true);
      setDirectiveError(null);
      
      const response = await intelligentTagApi.getDirectives(tag.suggestionId);
      
      if (response.data?.success) {
        setDirectives(response.data.data || []);
      } else {
        setDirectives([]);
      }
    } catch (error) {
      console.error('Error loading directives:', error);
      // If there's an error (like 404), clear the directives
      setDirectives([]);
      setDirectiveError(null); // Don't show error for missing data
    } finally {
      setIsLoadingDirectives(false);
    }
  };

  const handleUpdateDirective = async (suggestionId, directiveId, newDirective, newDirectiveAim) => {
    try {
      const response = await intelligentTagApi.updateDirective(suggestionId, directiveId, newDirective, newDirectiveAim);
      
      if (response.data?.success) {
        setDirectives(prev => prev.map(d => 
          d.id === directiveId ? response.data.data : d
        ));
        
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
        setDirectives(prev => prev.filter(d => d.id !== directiveId));
        
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
        setDirectives(prev => prev.map(d => 
          d.id === directiveId ? response.data.data : d
        ));
        
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

  const handleGenerateNewDirective = async (suggestionId) => {
    try {
      const response = await intelligentTagApi.generateDirective(suggestionId);
      
      if (response.data?.success) {
        setDirectives(prev => [response.data.data, ...prev]);
        
        // Trigger refresh of other tabs
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error('Failed to generate new directive');
      }
    } catch (error) {
      console.error('Error generating new directive:', error);
      throw error;
    }
  };

  // Only render if tag is accepted and has suggestionId
  if (!tag.suggestionId || tag.suggestionStatus !== 'accepted') {
    return null;
  }

  return (
    <div className="tag-directive mt-3">
      <DirectiveList
        directives={directives}
        suggestionId={tag.suggestionId}
        onUpdateDirective={handleUpdateDirective}
        onDeleteDirective={handleDeleteDirective}
        onRegenerateDirective={handleRegenerateDirective}
        onGenerateNewDirective={handleGenerateNewDirective}
        isLoading={isLoadingDirectives}
        error={directiveError}
      />
    </div>
  );
};

export default TagDirectivesTab; 