// src/pages/AddDeal.jsx
import React, { useState, useEffect } from 'react'
import {
  createDeal,
  fetchPipelines,
  fetchStages,
  fetchContacts,
  fetchCompanies,
} from '../services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AddDeal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  // If this is a modal, you might handle isOpen/onClose in a wrapper

  const [formData, setFormData] = useState({
    name: '',
    pipeline_id: '',
    stage_id: '',
    owner_email: '',
    amount: '',
    status: 'open',
    // For the many-to-many fields:
    linked_contacts_ids: [],
    linked_companies_ids: [],
  })

  const [pipelines, setPipelines] = useState([])
  const [stages, setStages] = useState([])
  const [contacts, setContacts] = useState([])
  const [companies, setCompanies] = useState([])

  const [loading, setLoading] = useState(false)

  const loadOptions = async () => {
    try {
      const [pipelinesRes, stagesRes, contactsRes, companiesRes] = await Promise.all([
        fetchPipelines(),
        fetchStages(),
        fetchContacts(),
        fetchCompanies(),
      ])
      setPipelines(pipelinesRes?.data || [])
      setStages(stagesRes?.data || [])
      setContacts(contactsRes?.data || [])
      setCompanies(companiesRes?.data || [])
    } catch (err) {
      console.error('Error fetching options:', err)
      toast.error('Failed to fetch options.')
    }
  }

  useEffect(() => {
    loadOptions()
    // eslint-disable-next-line
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Convert amount to float
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0.0,
      }
      await createDeal(payload)
      toast.success('Deal created successfully!')
      // If a modal, call onClose(). If a page, navigate:
      onClose ? onClose() : navigate('/deals')
    } catch (err) {
      console.error('Error creating deal:', err)
      toast.error('Failed to create deal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-semibold mb-6">Add New Deal</h1>
      <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
        {/* Deal Name */}
        <div>
          <label className="block mb-1 text-gray-200">Deal Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pipeline */}
        <div>
          <label className="block mb-1 text-gray-200">Pipeline</label>
          <select
            name="pipeline_id"
            value={formData.pipeline_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Pipeline</option>
            {pipelines.map((pipe) => (
              <option key={pipe.id} value={pipe.id}>
                {pipe.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stage */}
        <div>
          <label className="block mb-1 text-gray-200">Stage</label>
          <select
            name="stage_id"
            value={formData.stage_id}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Stage</option>
            {stages.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Owner Email */}
        <div>
          <label className="block mb-1 text-gray-200">Owner Email</label>
          <input
            type="email"
            name="owner_email"
            value={formData.owner_email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block mb-1 text-gray-200">Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block mb-1 text-gray-200">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded bg-gray-800
                       text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">Open</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Many-to-many fields (Contacts, Companies) if desired */}
        {/* Example: 
            <div>
              <label className="block mb-1 text-gray-200">Linked Contacts</label>
              <select
                name="linked_contacts_ids"
                value={formData.linked_contacts_ids}
                onChange={...} multiple
                className="..."
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
            </div>
        */}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 font-semibold text-white rounded-md
                        ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Adding...' : 'Add Deal'}
          </button>
        </div>
      </form>

      {/* If it's a modal, you might have a 'Close' button or call onClose */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 underline text-gray-300"
        >
          Cancel
        </button>
      )}
    </div>
  )
}

export default AddDeal