import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { format } from 'date-fns';
import {
  getCourts,
  getEquipment,
  getCoaches,
  getPricingRules,
  createCourt,
  updateCourt,
  deleteCourt,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  createCoach,
  updateCoach,
  deleteCoach,
  createPricingRule,
  updatePricingRule,
  deletePricingRule,
  getAllWaitlist,
  notifyWaitlistUser,
  adminRemoveFromWaitlist,
} from '../services/api';

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useBooking();
  
  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate('/login');
    } else if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const [activeTab, setActiveTab] = useState('courts');
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'courts':
          const courtsRes = await getCourts();
          setCourts(courtsRes.data.data);
          break;
        case 'equipment':
          const equipRes = await getEquipment();
          setEquipment(equipRes.data.data);
          break;
        case 'coaches':
          const coachesRes = await getCoaches();
          setCoaches(coachesRes.data.data);
          break;
        case 'pricing':
          const rulesRes = await getPricingRules();
          setPricingRules(rulesRes.data.data);
          break;
        case 'waitlist':
          const waitlistRes = await getAllWaitlist();
          setWaitlist(waitlistRes.data.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      switch (type) {
        case 'court':
          await deleteCourt(id);
          break;
        case 'equipment':
          await deleteEquipment(id);
          break;
        case 'coach':
          await deleteCoach(id);
          break;
        case 'pricing':
          await deletePricingRule(id);
          break;
        default:
          break;
      }
      setMessage({ type: 'success', text: 'Item deleted successfully' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete item' });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingItem) {
        // Update
        switch (activeTab) {
          case 'courts':
            await updateCourt(editingItem._id, data);
            break;
          case 'equipment':
            await updateEquipment(editingItem._id, data);
            break;
          case 'coaches':
            await updateCoach(editingItem._id, data);
            break;
          case 'pricing':
            await updatePricingRule(editingItem._id, data);
            break;
          default:
            break;
        }
        setMessage({ type: 'success', text: 'Item updated successfully' });
      } else {
        // Create
        switch (activeTab) {
          case 'courts':
            await createCourt(data);
            break;
          case 'equipment':
            await createEquipment(data);
            break;
          case 'coaches':
            await createCoach(data);
            break;
          case 'pricing':
            await createPricingRule(data);
            break;
          default:
            break;
        }
        setMessage({ type: 'success', text: 'Item created successfully' });
      }
      handleFormClose();
      loadData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Operation failed' 
      });
    }
  };

  const handleNotifyWaitlist = async (id) => {
    try {
      await notifyWaitlistUser(id);
      setMessage({ type: 'success', text: 'User notified successfully' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to notify user' });
    }
  };

  const handleRemoveWaitlist = async (id) => {
    if (!window.confirm('Are you sure you want to remove this entry?')) {
      return;
    }
    try {
      await adminRemoveFromWaitlist(id);
      setMessage({ type: 'success', text: 'Removed from waitlist' });
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove entry' });
    }
  };

  return (
    <div className="container">
      <h1>Admin Panel</h1>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          className={`btn ${activeTab === 'courts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('courts')}
        >
          Courts
        </button>
        <button
          className={`btn ${activeTab === 'equipment' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('equipment')}
        >
          Equipment
        </button>
        <button
          className={`btn ${activeTab === 'coaches' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('coaches')}
        >
          Coaches
        </button>
        <button
          className={`btn ${activeTab === 'pricing' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pricing')}
        >
          Pricing Rules
        </button>
        <button
          className={`btn ${activeTab === 'waitlist' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('waitlist')}
        >
          Waitlist ({waitlist.length})
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management</h2>
          {activeTab !== 'waitlist' && (
            <button className="btn btn-success" onClick={handleAdd}>
              + Add New
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeTab === 'courts' && (
              <CourtsTable courts={courts} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            {activeTab === 'equipment' && (
              <EquipmentTable equipment={equipment} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            {activeTab === 'coaches' && (
              <CoachesTable coaches={coaches} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            {activeTab === 'pricing' && (
              <PricingRulesTable rules={pricingRules} onEdit={handleEdit} onDelete={handleDelete} />
            )}
            {activeTab === 'waitlist' && (
              <WaitlistTable 
                waitlist={waitlist} 
                onNotify={handleNotifyWaitlist} 
                onRemove={handleRemoveWaitlist} 
              />
            )}
          </>
        )}
      </div>

      {showForm && (
        <FormModal
          type={activeTab}
          item={editingItem}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};

// Courts Table
const CourtsTable = ({ courts, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Base Rate</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {courts.map((court) => (
        <tr key={court._id}>
          <td>{court.name}</td>
          <td><span className="badge badge-info">{court.type}</span></td>
          <td>₹{court.baseRate}/hr</td>
          <td><span className={`badge badge-${court.status === 'active' ? 'success' : 'warning'}`}>{court.status}</span></td>
          <td>
            <button className="btn btn-primary" style={{ marginRight: '5px', padding: '5px 10px' }} onClick={() => onEdit(court)}>
              Edit
            </button>
            <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => onDelete(court._id, 'court')}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Equipment Table
const EquipmentTable = ({ equipment, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Quantity</th>
        <th>Rate</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {equipment.map((item) => (
        <tr key={item._id}>
          <td>{item.name}</td>
          <td><span className="badge badge-info">{item.type}</span></td>
          <td>{item.totalQuantity}</td>
          <td>₹{item.rate}/hr</td>
          <td><span className={`badge badge-${item.status === 'available' ? 'success' : 'warning'}`}>{item.status}</span></td>
          <td>
            <button className="btn btn-primary" style={{ marginRight: '5px', padding: '5px 10px' }} onClick={() => onEdit(item)}>
              Edit
            </button>
            <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => onDelete(item._id, 'equipment')}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Coaches Table
const CoachesTable = ({ coaches, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Hourly Rate</th>
        <th>Specialization</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {coaches.map((coach) => (
        <tr key={coach._id}>
          <td>{coach.name}</td>
          <td>{coach.email}</td>
          <td>₹{coach.hourlyRate}/hr</td>
          <td>{coach.specialization.join(', ')}</td>
          <td><span className={`badge badge-${coach.status === 'active' ? 'success' : 'warning'}`}>{coach.status}</span></td>
          <td>
            <button className="btn btn-primary" style={{ marginRight: '5px', padding: '5px 10px' }} onClick={() => onEdit(coach)}>
              Edit
            </button>
            <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => onDelete(coach._id, 'coach')}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Pricing Rules Table
const PricingRulesTable = ({ rules, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Value</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {rules.map((rule) => (
        <tr key={rule._id}>
          <td>{rule.name}</td>
          <td><span className="badge badge-info">{rule.ruleType}</span></td>
          <td>{rule.ruleType === 'multiplier' ? `${rule.value}x` : `+₹${rule.value}`}</td>
          <td>{rule.priority}</td>
          <td><span className={`badge badge-${rule.isActive ? 'success' : 'warning'}`}>{rule.isActive ? 'Active' : 'Inactive'}</span></td>
          <td>
            <button className="btn btn-primary" style={{ marginRight: '5px', padding: '5px 10px' }} onClick={() => onEdit(rule)}>
              Edit
            </button>
            <button className="btn btn-danger" style={{ padding: '5px 10px' }} onClick={() => onDelete(rule._id, 'pricing')}>
              Delete
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Form Modal Component
const FormModal = ({ type, item, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(item || {});

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked : inputType === 'number' ? Number(value) : value,
    });
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData({
      ...formData,
      [parent]: {
        ...formData[parent],
        [field]: value,
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <h2>{item ? 'Edit' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1, -1)}</h2>
        <form onSubmit={handleSubmit}>
          {type === 'courts' && (
            <>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type || 'indoor'} onChange={handleChange} required>
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Base Rate (₹/hr) *</label>
                <input name="baseRate" type="number" value={formData.baseRate || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status || 'active'} onChange={handleChange} required>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="3" />
              </div>
            </>
          )}

          {type === 'equipment' && (
            <>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="type" value={formData.type || 'racket'} onChange={handleChange} required>
                  <option value="racket">Racket</option>
                  <option value="shoes">Shoes</option>
                  <option value="shuttlecock">Shuttlecock</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Total Quantity *</label>
                <input name="totalQuantity" type="number" value={formData.totalQuantity || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Rate (₹/hr) *</label>
                <input name="rate" type="number" value={formData.rate || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status || 'available'} onChange={handleChange} required>
                  <option value="available">Available</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="2" />
              </div>
            </>
          )}

          {type === 'coaches' && (
            <>
              <div className="form-group">
                <label>Name *</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input name="email" type="email" value={formData.email || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input name="phone" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Hourly Rate (₹/hr) *</label>
                <input name="hourlyRate" type="number" value={formData.hourlyRate || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Status *</label>
                <select name="status" value={formData.status || 'active'} onChange={handleChange} required>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} rows="3" />
              </div>
            </>
          )}

          {type === 'pricing' && (
            <>
              <div className="form-group">
                <label>Rule Name *</label>
                <input name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description || ''} onChange={handleChange} rows="2" />
              </div>
              <div className="form-group">
                <label>Rule Type *</label>
                <select name="ruleType" value={formData.ruleType || 'multiplier'} onChange={handleChange} required>
                  <option value="multiplier">Multiplier</option>
                  <option value="addition">Addition</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value *</label>
                <input name="value" type="number" step="0.01" value={formData.value || ''} onChange={handleChange} required />
                <small>{formData.ruleType === 'multiplier' ? 'e.g., 1.5 for 50% increase' : 'e.g., 200 for ₹200 extra'}</small>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <input name="priority" type="number" value={formData.priority || 0} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    name="isActive" 
                    checked={formData.isActive !== false} 
                    onChange={handleChange}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Active
                </label>
              </div>

              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Conditions</h4>
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.conditions?.isPeakHour || false}
                    onChange={(e) => handleNestedChange('conditions', 'isPeakHour', e.target.checked)}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Peak Hour
                </label>
              </div>
              {formData.conditions?.isPeakHour && (
                <>
                  <div className="form-group">
                    <label>Peak Start Time</label>
                    <input 
                      type="time" 
                      value={formData.conditions?.peakHourStart || ''}
                      onChange={(e) => handleNestedChange('conditions', 'peakHourStart', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Peak End Time</label>
                    <input 
                      type="time" 
                      value={formData.conditions?.peakHourEnd || ''}
                      onChange={(e) => handleNestedChange('conditions', 'peakHourEnd', e.target.value)}
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.conditions?.isWeekend || false}
                    onChange={(e) => handleNestedChange('conditions', 'isWeekend', e.target.checked)}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Weekend Only
                </label>
              </div>
              <div className="form-group">
                <label>Court Type</label>
                <select 
                  value={formData.conditions?.courtType || 'any'}
                  onChange={(e) => handleNestedChange('conditions', 'courtType', e.target.value)}
                >
                  <option value="any">Any</option>
                  <option value="indoor">Indoor Only</option>
                  <option value="outdoor">Outdoor Only</option>
                </select>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
              {item ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Waitlist Table Component
const WaitlistTable = ({ waitlist, onNotify, onRemove }) => {
  if (waitlist.length === 0) {
    return <div className="alert alert-info">No waitlist entries</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>User</th>
          <th>Court</th>
          <th>Date</th>
          <th>Time</th>
          <th>Position</th>
          <th>Status</th>
          <th>Requested</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {waitlist.map((entry) => (
          <tr key={entry._id}>
            <td>
              <strong>{entry.userName}</strong>
              <br />
              <small>{entry.userEmail}</small>
            </td>
            <td>{entry.court?.name || 'N/A'}</td>
            <td>{format(new Date(entry.date), 'MMM dd, yyyy')}</td>
            <td>{entry.startTime} - {entry.endTime}</td>
            <td>
              <span className="badge badge-info">#{entry.position}</span>
            </td>
            <td>
              <span className={`badge ${entry.status === 'notified' ? 'badge-success' : 'badge-warning'}`}>
                {entry.status}
              </span>
            </td>
            <td>
              <small>{format(new Date(entry.createdAt), 'MMM dd, HH:mm')}</small>
            </td>
            <td>
              {entry.status === 'waiting' && (
                <button
                  className="btn btn-success"
                  onClick={() => onNotify(entry._id)}
                  style={{ marginRight: '5px', fontSize: '12px' }}
                >
                  Notify
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => onRemove(entry._id)}
                style={{ fontSize: '12px' }}
              >
                Remove
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminPage;
