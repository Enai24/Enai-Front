import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import sanitizeHtml from 'sanitize-html';

const RealtimeEmailDraft = ({ lead }) => {
  const [draft, setDraft] = useState("Draft will appear here...");
  const [error, setError] = useState("");
  const [subject, setSubject] = useState(`Checking In - Opportunity with ${lead.company}`);
  const [website, setWebsite] = useState(lead.website || '');

  useEffect(() => {
    const socket = new WebSocket(`wss://${window.location.host}/ws/email_draft/`);
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.draft) setDraft(data.draft);
      else if (data.error) {
        setError(data.error);
        toast.error(data.error);
      }
    };
    socket.onclose = () => {
      setError("WebSocket connection closed.");
      toast.error("WebSocket connection closed.");
    };
    return () => socket.close();
  }, []);

  const requestDraft = () => {
    const socket = new WebSocket(`wss://${window.location.host}/ws/email_draft/`);
    socket.onopen = () => {
      socket.send(JSON.stringify({
        prompt: {
          lead: { id: lead.id, first_name: lead.first_name, last_name: lead.last_name, company: lead.company },
          subject: sanitizeHtml(subject),
          website: sanitizeHtml(website)
        }
      }));
      setDraft("Generating draft, please wait...");
    };
  };

  return (
    <div className="p-6 bg-gray-800 rounded shadow">
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white border border-gray-600"
      />
      <input
        type="url"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="w-full p-2 mb-4 rounded-md bg-gray-700 text-white border border-gray-600"
        placeholder="Enter website URL"
      />
      <button onClick={requestDraft} className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700">Generate Draft</button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      <div className="mt-6 p-4 bg-gray-700 rounded">{draft}</div>
    </div>
  );
};

export default RealtimeEmailDraft;