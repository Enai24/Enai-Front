// src/pages/ViewEmail.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEmailById, sendTestEmail } from '../services/api';
import EmailView from '../components/EmailView';
import { toast } from 'react-toastify';
import SendTestEmailModal from '../components/SendTestEmailModal';

const ViewEmail = () => {
  const { emailId } = useParams();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Modal for test email
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const fetchedEmail = await fetchEmailById(emailId);
        setEmail(fetchedEmail);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching email:', err);
        setError(true);
        setLoading(false);
        toast.error('Failed to fetch email details.');
      }
    };
    fetchEmail();
  }, [emailId]);

  const handleSendTest = async (testRecipient) => {
    try {
      await sendTestEmail(emailId, { test_recipient: testRecipient });
      toast.success('Test email sent successfully.');
      setIsTestModalOpen(false);
    } catch (err) {
      console.error('Error sending test email:', err);
      toast.error('Failed to send test email.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-white">
        Loading...
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-red-400">
        Error loading email details.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-900 text-white rounded-lg shadow-lg">
      <EmailView email={email} onSendTest={() => setIsTestModalOpen(true)} />

      {/* Test Email Modal */}
      {isTestModalOpen && (
        <SendTestEmailModal
          isOpen={isTestModalOpen}
          closeModal={() => setIsTestModalOpen(false)}
          onSend={handleSendTest}
        />
      )}
    </div>
  );
};

export default ViewEmail;