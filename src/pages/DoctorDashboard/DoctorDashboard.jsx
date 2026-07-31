import { useState } from 'react';
import { 
  Users, Calendar as CalendarIcon, Star, TrendingUp, 
  Search, MessageSquare, ChevronRight, CheckCircle2, Clock,
  X, FileText, Pill, Activity, Heart, Droplets, Weight,
  ClipboardList, Send, Stethoscope, AlertCircle
} from 'lucide-react';
import { doctorPatients, appointments as mockAppointments, patients, patientVitals } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import VitalsChart from '../../components/ui/VitalsChart';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast, getPatientVitals, appointments: apptsFromCtx } = useApp();

  // ── Modal state ──
  const [consultModal, setConsultModal] = useState(null);   // appointment object | null
  const [consultNotes, setConsultNotes] = useState('');
  const [consultRx, setConsultRx] = useState('');
  const [consultStatus, setConsultStatus] = useState('in-progress'); // in-progress | completed
  const [completedAppts, setCompletedAppts] = useState(new Set());

  const [patientModal, setPatientModal] = useState(null);   // doctorPatient object | null
  const [patientVitalTab, setPatientVitalTab] = useState('bloodSugar');

  // ── Data ──
  const todayAppts = mockAppointments.filter(a => a.doctorId === 'd1' && a.status === 'upcoming' && !completedAppts.has(a.id));
  const pastAppts = mockAppointments.filter(a => a.doctorId === 'd1' && (a.status === 'completed' || completedAppts.has(a.id)));

  const filteredPatients = doctorPatients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Handlers ──
  const handleStartConsultation = (appt) => {
    setConsultModal(appt);
    setConsultNotes('');
    setConsultRx('');
    setConsultStatus('in-progress');
  };

  const handleCompleteConsultation = () => {
    if (!consultModal) return;
    setCompletedAppts(prev => new Set([...prev, consultModal.id]));
    showToast(`${consultModal.patientName} ගේ consultation සාර්ථකව අවසන් විය ✅`, 'success');
    setConsultModal(null);
  };

  const handleOpenPatientRecord = (patient) => {
    setPatientModal(patient);
    setPatientVitalTab('bloodSugar');
  };

  // Get vitals data for the patient modal
  const getModalVitals = (patientId) => {
    return getPatientVitals(patientId) || patientVitals[patientId] || [];
  };

  // Get full patient info
  const getFullPatient = (patientId) => {
    return patients.find(p => p.id === patientId);
  };

  return (
    <div className="doc-dash">
      <div className="doc-dash__header">
        <h1 className="doc-dash__title">Doctor Dashboard</h1>
        <p className="doc-dash__subtitle">Manage your patients and appointments.</p>
      </div>

      <div className="doc-dash__stats">
        <StatCard 
          icon={CalendarIcon} 
          label="Today's Appointments" 
          value={todayAppts.length} 
          color="primary"
        />
        <StatCard 
          icon={Users} 
          label="Total Patients" 
          value={doctorPatients.length + 12} 
          trend="up" 
          trendValue="+3 this week"
          color="accent"
        />
        <StatCard 
          icon={CheckCircle2} 
          label="Consultations Done" 
          value={pastAppts.length + 45} 
          color="coral"
        />
        <StatCard 
          icon={Star} 
          label="Average Rating" 
          value="4.9" 
          trend="stable"
          color="amber"
        />
      </div>

      <div className="doc-dash__grid">
        <Card padding="normal" className="doc-dash__schedule-card">
          <div className="doc-dash__card-header">
            <h2 className="doc-dash__card-title">Today's Schedule</h2>
            <Badge variant="primary">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})}</Badge>
          </div>
          
          <div className="doc-dash__timeline">
            {todayAppts.length === 0 ? (
              <p className="doc-dash__empty-text">No appointments today.</p>
            ) : (
              todayAppts.sort((a, b) => a.time.localeCompare(b.time)).map((appt, i) => (
                <div key={appt.id} className="doc-dash__timeline-item animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="doc-dash__time">{appt.time}</div>
                  <div className="doc-dash__timeline-dot" />
                  <div className="doc-dash__timeline-content">
                    <div className="doc-dash__patient-info">
                      <Avatar initials={appt.patientInitials} size="sm" />
                      <div>
                        <h4>{appt.patientName}</h4>
                        <p>{appt.reason}</p>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => handleStartConsultation(appt)}>Start</Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card padding="normal" className="doc-dash__patients-card">
          <div className="doc-dash__card-header">
            <h2 className="doc-dash__card-title">Patient Roster</h2>
            <div className="doc-dash__search">
              <Input 
                icon={Search} 
                placeholder="Search patients..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="doc-dash__table-container">
            <table className="doc-dash__table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Condition</th>
                  <th>Last Visit</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <div className="doc-dash__table-patient">
                        <Avatar initials={patient.initials} size="sm" />
                        <div>
                          <strong>{patient.name}</strong>
                          <span>Age {patient.age}</span>
                        </div>
                      </div>
                    </td>
                    <td>{patient.condition}</td>
                    <td>{patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'New'}</td>
                    <td>
                      <Badge 
                        variant={patient.status === 'stable' ? 'success' : patient.status === 'critical' ? 'danger' : 'warning'}
                      >
                        {patient.status}
                      </Badge>
                    </td>
                    <td>
                      <button 
                        className="doc-dash__table-btn" 
                        title="View Patient Record"
                        onClick={() => handleOpenPatientRecord(patient)}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          Start Consultation Modal
          ══════════════════════════════════════════ */}
      {consultModal && (
        <div className="doc-modal-overlay" onClick={() => setConsultModal(null)}>
          <div className="doc-modal doc-modal--consult animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="doc-modal__header doc-modal__header--consult">
              <div className="doc-modal__header-left">
                <div className="doc-modal__icon-circle doc-modal__icon-circle--consult">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h2 className="doc-modal__title">Consultation Session</h2>
                  <p className="doc-modal__subtitle-text">{consultModal.patientName} • {consultModal.reason}</p>
                </div>
              </div>
              <button className="doc-modal__close" onClick={() => setConsultModal(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="doc-modal__body">
              {/* Patient Quick Info */}
              <div className="consult__patient-strip">
                <Avatar initials={consultModal.patientInitials} size="md" />
                <div className="consult__patient-details">
                  <h3>{consultModal.patientName}</h3>
                  <div className="consult__meta-row">
                    <span><Clock size={14} /> {consultModal.time}</span>
                    <span><CalendarIcon size={14} /> {consultModal.date}</span>
                  </div>
                </div>
                <Badge variant={consultStatus === 'completed' ? 'success' : 'warning'}>
                  {consultStatus === 'completed' ? '✅ Completed' : '🔄 In Progress'}
                </Badge>
              </div>

              {/* Notes */}
              <div className="consult__section">
                <label className="consult__label">
                  <FileText size={16} />
                  Consultation Notes
                </label>
                <textarea 
                  className="consult__textarea"
                  placeholder="Enter consultation notes, observations, diagnosis..."
                  value={consultNotes}
                  onChange={e => setConsultNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {/* Prescription */}
              <div className="consult__section">
                <label className="consult__label">
                  <Pill size={16} />
                  Prescription
                </label>
                <textarea 
                  className="consult__textarea"
                  placeholder="Enter prescribed medications, dosages, instructions..."
                  value={consultRx}
                  onChange={e => setConsultRx(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Reason */}
              <div className="consult__section">
                <label className="consult__label">
                  <AlertCircle size={16} />
                  Visit Reason
                </label>
                <div className="consult__info-box">
                  {consultModal.reason}
                  {consultModal.notes && <span className="consult__info-note">Note: {consultModal.notes}</span>}
                </div>
              </div>
            </div>

            <div className="doc-modal__footer">
              <Button variant="ghost" onClick={() => setConsultModal(null)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleCompleteConsultation}
              >
                <CheckCircle2 size={16} />
                Complete Consultation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          Patient Health Record Modal
          ══════════════════════════════════════════ */}
      {patientModal && (() => {
        const fullPatient = getFullPatient(patientModal.id);
        const vitalsData = getModalVitals(patientModal.id);
        const latestVital = vitalsData.length > 0 ? vitalsData[vitalsData.length - 1] : null;

        return (
          <div className="doc-modal-overlay" onClick={() => setPatientModal(null)}>
            <div className="doc-modal doc-modal--record animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="doc-modal__header doc-modal__header--record">
                <div className="doc-modal__header-left">
                  <div className="doc-modal__icon-circle doc-modal__icon-circle--record">
                    <ClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="doc-modal__title">Patient Health Record</h2>
                    <p className="doc-modal__subtitle-text">{patientModal.name}</p>
                  </div>
                </div>
                <button className="doc-modal__close" onClick={() => setPatientModal(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="doc-modal__body">
                {/* Patient Info Header */}
                <div className="record__patient-header">
                  <Avatar initials={patientModal.initials} size="lg" />
                  <div className="record__patient-info">
                    <h3>{patientModal.name}</h3>
                    <div className="record__meta-grid">
                      <span>Age: <strong>{patientModal.age}</strong></span>
                      {fullPatient && <span>Gender: <strong>{fullPatient.gender}</strong></span>}
                      {fullPatient && <span>Blood: <strong>{fullPatient.bloodType}</strong></span>}
                      {fullPatient && <span>Phone: <strong>{fullPatient.phone}</strong></span>}
                    </div>
                  </div>
                  <Badge 
                    variant={patientModal.status === 'stable' ? 'success' : patientModal.status === 'critical' ? 'danger' : 'warning'}
                  >
                    {patientModal.status}
                  </Badge>
                </div>

                {/* Condition */}
                <div className="record__section">
                  <h4 className="record__section-title">
                    <Activity size={16} /> Conditions
                  </h4>
                  <div className="record__condition-tags">
                    {patientModal.condition.split(', ').map((c, i) => (
                      <span key={i} className="record__condition-tag">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Latest Vitals Strip */}
                {latestVital && (
                  <div className="record__vitals-strip">
                    <div className="record__vital-card record__vital-card--sugar">
                      <Droplets size={18} />
                      <div>
                        <span className="record__vital-label">Blood Sugar</span>
                        <span className="record__vital-value">{latestVital.bloodSugar} <small>mg/dL</small></span>
                      </div>
                    </div>
                    <div className="record__vital-card record__vital-card--bp">
                      <Heart size={18} />
                      <div>
                        <span className="record__vital-label">Blood Pressure</span>
                        <span className="record__vital-value">{latestVital.systolic}/{latestVital.diastolic} <small>mmHg</small></span>
                      </div>
                    </div>
                    <div className="record__vital-card record__vital-card--weight">
                      <Weight size={18} />
                      <div>
                        <span className="record__vital-label">Weight</span>
                        <span className="record__vital-value">{latestVital.weight} <small>kg</small></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vitals Chart */}
                {vitalsData.length > 0 && (
                  <div className="record__section">
                    <div className="record__chart-header">
                      <h4 className="record__section-title">
                        <TrendingUp size={16} /> Vitals Trend
                      </h4>
                      <div className="record__chart-tabs">
                        <button 
                          className={`record__tab ${patientVitalTab === 'bloodSugar' ? 'record__tab--active' : ''}`}
                          onClick={() => setPatientVitalTab('bloodSugar')}
                        >
                          Blood Sugar
                        </button>
                        <button 
                          className={`record__tab ${patientVitalTab === 'bloodPressure' ? 'record__tab--active' : ''}`}
                          onClick={() => setPatientVitalTab('bloodPressure')}
                        >
                          Blood Pressure
                        </button>
                      </div>
                    </div>
                    <div className="record__chart-container">
                      <VitalsChart data={vitalsData} metric={patientVitalTab} />
                    </div>
                  </div>
                )}

                {/* Location & Emergency */}
                {fullPatient && (
                  <div className="record__info-grid">
                    <div className="record__info-item">
                      <span className="record__info-label">Location</span>
                      <span className="record__info-value">{fullPatient.location}</span>
                    </div>
                    <div className="record__info-item">
                      <span className="record__info-label">Emergency Contact</span>
                      <span className="record__info-value">{fullPatient.emergencyContact}</span>
                    </div>
                    <div className="record__info-item">
                      <span className="record__info-label">Last Visit</span>
                      <span className="record__info-value">
                        {patientModal.lastVisit ? new Date(patientModal.lastVisit).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'New Patient'}
                      </span>
                    </div>
                    <div className="record__info-item">
                      <span className="record__info-label">Member Since</span>
                      <span className="record__info-value">
                        {new Date(fullPatient.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="doc-modal__footer">
                <Button variant="ghost" onClick={() => setPatientModal(null)}>Close</Button>
                <Button variant="primary" onClick={() => {
                  showToast(`${patientModal.name} ට message එවන ලදී 📩`, 'info');
                  setPatientModal(null);
                }}>
                  <MessageSquare size={16} />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
