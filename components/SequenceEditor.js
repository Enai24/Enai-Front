// src/components/SequenceEditor.js
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { Phone, Mail, FileText, Plus, X, ChevronDown, Divide, Copy } from 'lucide-react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateSequence } from '../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const generateId = () => Math.random().toString(36).substring(2, 15);

function CampaignStep({ step, index, onDelete, onUpdate, onDuplicate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showABTestModal, setShowABTestModal] = useState(false);
  const [variations, setVariations] = useState(step.variations || []);
  const [currentVariation, setCurrentVariation] = useState({ subject: '', body: '' });

  const toggleDetails = () => setIsExpanded(!isExpanded);

  const addVariation = () => {
    if (variations.length < 2) {
      const newVariation = { id: generateId(), subject: '', body: '' };
      setVariations([...variations, newVariation]);
      setCurrentVariation(newVariation);
      setShowABTestModal(true);
    } else {
      toast.warning('Only two variations (A/B) are supported.');
    }
  };

  const saveVariation = async () => {
    const updatedStep = { ...step, variations };
    try {
      await onUpdate(updatedStep);
      setShowABTestModal(false);
      toast.success("Variation updated.");
    } catch (error) {
      toast.error(`Failed saving A/B test: ${error.message}`);
    }
  };

  const renderVariationEdit = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Subject:</label>
        <input
          type="text"
          value={currentVariation.subject}
          onChange={(e) => setCurrentVariation({ ...currentVariation, subject: e.target.value })}
          className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-gray-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Body:</label>
        <ReactQuill
          value={currentVariation.body}
          onChange={(content) => setCurrentVariation({ ...currentVariation, body: content })}
          className="bg-gray-700 text-gray-100"
        />
      </div>
    </div>
  );

  const handleABTestEdit = (variation) => {
    setCurrentVariation(variation);
    setShowABTestModal(true);
  };

  return (
    <Draggable draggableId={step.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="mb-4 border border-gray-700 rounded-lg shadow-sm bg-gray-800 text-white"
        >
          <div className="flex items-center justify-between p-4 cursor-pointer select-none" {...provided.dragHandleProps}>
            <div className="flex items-center gap-4">
              <div className={`${step.iconBg || 'bg-gray-600'} p-2 rounded-lg`}>
                {step.icon ? <step.icon className="w-5 h-5 text-white" /> : <FileText className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="font-medium text-gray-100">{step.title}</h3>
                <p className="text-sm text-gray-300">{step.description}</p>
                {step.type === 'manual_email' && !step.approved && (
                  <button
                    onClick={() => onUpdate({ ...step, approved: true })}
                    className="mt-2 px-3 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 transition"
                    aria-label="Approve email step"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {['automatic_email', 'manual_email'].includes(step.type) && (
                <button
                  onClick={addVariation}
                  title="Create A/B Test"
                  className="text-gray-300 hover:text-blue-500 transition p-1.5 rounded"
                  aria-label="Add A/B test variation"
                >
                  <Divide className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => onDuplicate(step)} title="Duplicate Step" className="text-gray-300 hover:text-white transition p-1.5 rounded" aria-label="Duplicate step">
                <Copy />
              </button>
              <button onClick={() => onDelete(step.id)} className="text-red-400 hover:text-red-500 transition p-1.5 rounded" aria-label="Delete step">
                <X className="w-4 h-4" />
              </button>
              <button onClick={toggleDetails} className="text-gray-300" aria-label={isExpanded ? "Collapse step details" : "Expand step details"}>
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-2 bg-gray-900 p-4 rounded">
              {step.variations?.length > 0 && (
                <>
                  <p className="text-lg font-medium mb-3 text-white">A/B Test Variations</p>
                  {step.variations.map((variant) => (
                    <div
                      key={variant.id}
                      className="bg-gray-700 px-3.5 py-2.5 mb-1.5 rounded-md cursor-pointer"
                      onClick={() => handleABTestEdit(variant)}
                    >
                      {variant.subject || <em>Blank subject, Click to add</em>}
                    </div>
                  ))}
                </>
              )}
              <p className="text-gray-300">Delivery: {step.deliveryTime ? new Date(step.deliveryTime).toLocaleString() : 'Immediately'}</p>
            </div>
          )}
          <Dialog open={showABTestModal} onClose={() => setShowABTestModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowABTestModal(false)} />
            <div className="relative bg-gray-800 p-6 rounded w-full max-w-md z-50 space-y-4">
              <Dialog.Title as="h3" className="text-lg font-bold mb-4 text-white">Edit Variation</Dialog.Title>
              {renderVariationEdit()}
              <div className="flex space-x-2.5 justify-end">
                <button onClick={() => setShowABTestModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" aria-label="Cancel variation edit">Cancel</button>
                <button onClick={saveVariation} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" aria-label="Save variation">Save</button>
              </div>
            </div>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
}

const SequenceEditor = ({ campaignId, sequences, reloadSequences }) => {
  const [localSequence, setLocalSequence] = useState(sequences[0] || { steps: [] });
  const [loading, setLoading] = useState(false);
  const [showAddStepModal, setShowAddStepModal] = useState(false);
  const [newStep, setNewStep] = useState({
    type: 'automatic_email',
    title: '',
    deliveryTime: null,
    content: '',
  });

  useEffect(() => {
    if (sequences.length > 0) setLocalSequence(sequences[0]);
  }, [sequences]);

  const debouncedPersist = useCallback(debounce(async (updatedSequence) => {
    try {
      await updateSequence(campaignId, updatedSequence.id, updatedSequence);
      if (reloadSequences) await reloadSequences();
    } catch (error) {
      toast.error(`Failed to update sequence: ${error.message}`);
    }
  }, 500), [campaignId, reloadSequences]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const items = Array.from(localSequence.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedSequence = { ...localSequence, steps: items };
    setLocalSequence(updatedSequence);
    debouncedPersist(updatedSequence);
  };

  const addNewStepToSequence = async () => {
    setLoading(true);
    try {
      const stepEntry = {
        id: generateId(),
        type: newStep.type,
        title: newStep.title || (newStep.type === 'automatic_email' ? "New Email Step" : "New Step"),
        description: newStep.title || (newStep.type === 'automatic_email' ? "New Email Step" : "New Step"),
        icon: newStep.type.includes('email') ? Mail : (newStep.type === 'phone_call' ? Phone : FileText),
        iconBg: newStep.type.includes('email') ? 'bg-blue-500' : (newStep.type === 'phone_call' ? 'bg-red-500' : 'bg-orange-500'),
        deliveryTime: newStep.deliveryTime,
        variations: (newStep.type === 'manual_email' || newStep.type === 'automatic_email') ? [{ id: generateId(), subject: "", body: "" }] : [],
      };
      const updatedSteps = [...localSequence.steps, stepEntry];
      const updatedSequence = { ...localSequence, steps: updatedSteps };
      setLocalSequence(updatedSequence);
      await updateSequence(campaignId, updatedSequence.id, updatedSequence);
      if (reloadSequences) await reloadSequences();
      setNewStep({ type: "automatic_email", title: "", deliveryTime: null, content: "" });
      setShowAddStepModal(false);
      toast.success("Step added successfully!");
    } catch (error) {
      toast.error(`Failed to add step: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteStep = async (stepId) => {
    const updatedSteps = localSequence.steps.filter((step) => step.id !== stepId);
    const updatedSequence = { ...localSequence, steps: updatedSteps };
    setLocalSequence(updatedSequence);
    await updateSequence(campaignId, updatedSequence.id, updatedSequence);
    if (reloadSequences) await reloadSequences();
    toast.success("Step deleted successfully!");
  };

  const duplicateStep = async (step) => {
    const duplicatedStep = { ...step, id: generateId() };
    const updatedSteps = [...localSequence.steps, duplicatedStep];
    const updatedSequence = { ...localSequence, steps: updatedSteps };
    setLocalSequence(updatedSequence);
    await updateSequence(campaignId, updatedSequence.id, updatedSequence);
    if (reloadSequences) await reloadSequences();
    toast.success("Step duplicated successfully!");
  };

  const updateStepStatus = async (updatedStep) => {
    const updatedSteps = localSequence.steps.map(s => s.id === updatedStep.id ? updatedStep : s);
    const updatedSequence = { ...localSequence, steps: updatedSteps };
    setLocalSequence(updatedSequence);
    await updateSequence(campaignId, updatedSequence.id, updatedSequence);
    if (reloadSequences) await reloadSequences();
    toast.success("Step updated successfully!");
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-100">Sequence: {localSequence?.name}</h2>
      {localSequence.steps.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="sequence-steps">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {localSequence.steps.map((step, index) => (
                  <CampaignStep
                    key={step.id}
                    step={step}
                    index={index}
                    onDelete={deleteStep}
                    onUpdate={updateStepStatus}
                    onDuplicate={duplicateStep}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="text-gray-300">No steps in this sequence yet.</p>
      )}
      <button
        onClick={() => setShowAddStepModal(true)}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        aria-label="Add new step"
      >
        Add Step
      </button>

      <Dialog open={showAddStepModal} onClose={() => setShowAddStepModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black opacity-50" onClick={() => setShowAddStepModal(false)} />
        <div className="relative bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4">
          <button onClick={() => setShowAddStepModal(false)} className="absolute top-2 right-2 p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition" aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
          <h3 className="text-xl font-bold mb-4 text-white">Add New Step</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="stepType" className="block text-sm font-medium text-gray-300">Step Type</label>
              <select
                id="stepType"
                value={newStep.type}
                onChange={(e) => setNewStep({ ...newStep, type: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                aria-label="Select step type"
              >
                {['automatic_email', 'manual_email', 'phone_call', 'action_item', 'linkedin_request'].map(type => (
                  <option key={type} value={type}>
                    {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="stepTitle" className="block text-sm font-medium text-gray-300">Step Title</label>
              <input
                id="stepTitle"
                type="text"
                placeholder="Step Title"
                value={newStep.title}
                onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                className="w-full p-2 rounded bg-gray-700 mt-1 border border-gray-600 text-gray-100"
                aria-label="Step title"
              />
            </div>
            {(newStep.type === "automatic_email" || newStep.type === 'manual_email') && (
              <div>
                <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-300">Delivery Time</label>
                <DatePicker
                  id="deliveryTime"
                  selected={newStep.deliveryTime}
                  onChange={(date) => setNewStep({ ...newStep, deliveryTime: date })}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="w-full p-2 rounded bg-gray-700 mt-1 border border-gray-600 text-gray-100"
                  placeholderText="Select date and time"
                />
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowAddStepModal(false)} className="bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded-md text-white" aria-label="Cancel step addition">Cancel</button>
              <button
                onClick={addNewStepToSequence}
                disabled={loading}
                className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:bg-gray-600"
                aria-label="Confirm and add step"
              >
                {loading ? 'Adding...' : 'Confirm & Add'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default SequenceEditor;