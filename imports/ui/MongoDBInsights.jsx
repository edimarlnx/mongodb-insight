import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { ProfileLevelControls } from './components/mongodb/ProfileLevelControls';
import { AnalysisControls } from './components/mongodb/AnalysisControls';
import { ResultsDisplay } from './components/mongodb/ResultsDisplay';
import { ConfirmationModal } from './components/mongodb/ConfirmationModal';

export const MongoDBInsights = () => {
  const [profileLevel, setProfileLevel] = useState(0);
  const [minMillis, setMinMillis] = useState('100');
  const [collection, setCollection] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [expandedQueries, setExpandedQueries] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showOnlyWithIndex, setShowOnlyWithIndex] = useState(false);

  useEffect(() => {
    Meteor.call('mongodb.profile.status', (error, result) => {
      if (error) {
        setError(error.message);
      } else {
        setProfileLevel(result.was);
      }
    });
  }, []);

  const handleSetProfileLevel = (level) => {
    setLoading(true);
    Meteor.call('mongodb.profile.set', level, (error) => {
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setProfileLevel(level);
        setError(null);
      }
    });
  };

  const handleAnalyze = () => {
    setLoading(true);
    setCurrentPage(1);
    const params = {
      minMillis: parseInt(minMillis, 10),
      collection: collection || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    };

    Meteor.call('mongodb.profile.analyze', params, (error, result) => {
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setResults(result);
        setError(null);
      }
    });
  };

  const paginatedResults = () => {
    if (!results) return [];
    
    const filteredResults = results.filter(result => {
      const severityMatch = severityFilter === 'all' || 
        result.issues.some(issue => issue.severity.toLowerCase() === severityFilter.toLowerCase());
      
      const indexMatch = !showOnlyWithIndex || 
        result.issues.some(issue => issue.recommendedIndex);
      
      return severityMatch && indexMatch;
    });
    
    return filteredResults;
  };

  const totalPages = results ? Math.ceil(paginatedResults().length / itemsPerPage) : 0;

  const getCurrentPageResults = () => {
    const filtered = paginatedResults();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-600';
      case 'medium':
        return 'bg-yellow-600';
      case 'low':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  const toggleQueryDetails = (index) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleCreateIndex = (indexSuggestion) => {
    const matches = indexSuggestion.match(/db\.(\w+)\.createIndex\((.+)\)/);
    if (!matches) {
      setError('Invalid index suggestion format');
      return;
    }
    
    const [_, collection, indexSpecString] = matches;
    try {
      const cleanedSpecString = indexSpecString
        .replace(/'/g, '"')
        .replace(/NumberInt\((\d+)\)/g, '$1')
        .replace(/NumberLong\((\d+)\)/g, '$1');
      
      const indexSpec = eval(`(${cleanedSpecString})`);
      
      setSelectedIndex({
        collection,
        indexSpec,
        original: indexSuggestion
      });
      setShowModal(true);
    } catch (err) {
      console.error('Failed to parse index specification:', err);
      setError('Failed to parse index specification');
    }
  };

  const confirmCreateIndex = () => {
    if (!selectedIndex) {
      console.error('No index selected');
      setError('No index selected');
      return;
    }
    
    console.log('Creating index:', {
      collection: selectedIndex.collection,
      indexSpec: selectedIndex.indexSpec
    });
    
    setLoading(true);
    Meteor.call('mongodb.createIndex', selectedIndex.collection, selectedIndex.indexSpec, (error) => {
      setLoading(false);
      if (error) {
        console.error('Index creation error:', error);
        setError(error.message);
      } else {
        setError(null);
        // Refresh analysis after creating index
        handleAnalyze();
      }
    });
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-white">MongoDB Insights</h1>
      
      <ProfileLevelControls 
        profileLevel={profileLevel}
        onSetProfileLevel={handleSetProfileLevel}
      />

      <AnalysisControls
        minMillis={minMillis}
        collection={collection}
        startDate={startDate}
        endDate={endDate}
        onMinMillisChange={(e) => setMinMillis(e.target.value)}
        onCollectionChange={(e) => setCollection(e.target.value)}
        onStartDateChange={(e) => setStartDate(e.target.value)}
        onEndDateChange={(e) => setEndDate(e.target.value)}
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-300"
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded">
          {error}
        </div>
      )}

      {results && (
        <ResultsDisplay
          results={results}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          severityFilter={severityFilter}
          showOnlyWithIndex={showOnlyWithIndex}
          onShowOnlyWithIndexChange={(e) => {
            setShowOnlyWithIndex(e.target.checked);
            setCurrentPage(1);
          }}
          onSeverityFilterChange={(e) => {
            setSeverityFilter(e.target.value);
            setCurrentPage(1);
          }}
          onItemsPerPageChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          onPageChange={setCurrentPage}
          paginatedResults={getCurrentPageResults()}
          totalPages={totalPages}
          onCreateIndex={handleCreateIndex}
        />
      )}

      <ConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmCreateIndex}
        indexDetails={selectedIndex}
      />
    </div>
  );
}; 