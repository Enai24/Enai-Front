// src/components/SendTestEmailModal.js

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Button from './Button';

const SendTestEmailModal = ({ isOpen, closeModal, onSend }) => {
  const [testRecipient, setTestRecipient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testRecipient) {
      alert('Please enter a test recipient email.');
      return;
    }
    onSend(testRecipient);
    setTestRecipient('');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                >
                  Send Test Email
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div>
                    <label htmlFor="testRecipient" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Test Recipient Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="testRecipient"
                      name="testRecipient"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-2">
                    <Button type="button" variant="secondary" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Send
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SendTestEmailModal;