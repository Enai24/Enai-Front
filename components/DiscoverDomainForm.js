import React, { useState, useEffect, useRef } from 'react';
import Button from './Button'; // Assuming Button is a styled component
import { toast } from 'react-toastify';

// Simulated company data (replace with API call in a real app)
const companyData = [
  { name: 'Apple', domain: 'apple.com' },
  { name: 'Amazon', domain: 'amazon.com' },
  { name: 'Google', domain: 'google.com' },
  { name: 'Microsoft', domain: 'microsoft.com' },
  { name: 'Adobe', domain: 'adobe.com' },
  { name: 'Atlassian', domain: 'atlassian.com' },
  { name: 'Basecamp', domain: 'basecamp.com' },
  { name: 'Cisco', domain: 'cisco.com' },
];

const DiscoverDomainForm = ({ onSearch }) => {
  const [domain, setDomain] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);

  // Handle input change and filter suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDomain(value);

    if (value.trim()) {
      const filtered = companyData.filter((company) =>
        company.name.toLowerCase().startsWith(value.toLowerCase()) ||
        company.domain.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Handle suggestion selection
  const handleSuggestionClick = (company) => {
    setDomain(company.domain);
    setSuggestions([]);
    setIsFocused(false);
    onSearch(company.domain); // Trigger search immediately on selection
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      toast.error('Please enter a domain.');
      return;
    }
    setSuggestions([]);
    onSearch(domain.trim());
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        suggestionRef.current && !suggestionRef.current.contains(e.target)
      ) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700/50 transition-all duration-200 relative"
      aria-label="Discover Domain Search Form"
    >
      {/* Domain Input */}
      <div className="space-y-2 relative">
        <label
          htmlFor="domain"
          className="block text-sm font-medium text-gray-300 tracking-wide"
        >
          Domain <span className="text-orange-400">*</span>
        </label>
        <input
          type="text"
          id="domain"
          name="domain"
          value={domain}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          required
          ref={inputRef}
          placeholder="e.g., example.com or type a company name"
          className="block w-full px-4 py-2 bg-gray-700/90 text-gray-100 border border-gray-600 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 placeholder-gray-400"
          aria-required="true"
          aria-describedby="domain-help"
          autoComplete="off"
        />
        <p id="domain-help" className="text-xs text-gray-400 mt-1">
          Enter a company domain or start typing a name to see suggestions.
        </p>

        {/* Suggestions Dropdown */}
        {isFocused && suggestions.length > 0 && (
          <ul
            ref={suggestionRef}
            className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((company, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(company)}
                className="px-4 py-2 text-gray-100 hover:bg-gray-600 cursor-pointer transition-colors duration-150 flex justify-between items-center"
              >
                <span className="font-medium">{company.name}</span>
                <span className="text-sm text-gray-400">{company.domain}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Submit Button */}
      <div>
        <Button
          type="submit"
          variant="primary"
          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all duration-200 shadow-md hover:shadow-orange-500/30"
        >
          Search Domain
        </Button>
      </div>
    </form>
  );
};

export default DiscoverDomainForm;