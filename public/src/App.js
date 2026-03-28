import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Clock, MapPin, Route, Zap, AlertCircle,
  BookOpen, GraduationCap, Footprints, Timer, Sparkles,
  CalendarDays, Building2, Search, X, ArrowRight
} from 'lucide-react';

// ─────────────────────────────────────────────
// Virginia Tech Campus Building Locations (real coords)
// ─────────────────────────────────────────────
const LOCATIONS = {
  'Torgersen Hall':       { lat: 37.22946, lng: -80.42042, color: '#E87722', abbr: 'TORG' },
  'McBryde Hall':         { lat: 37.22836, lng: -80.42502, color: '#861F41', abbr: 'MCBR' },
  'Derring Hall':         { lat: 37.22876, lng: -80.42379, color: '#75B2DD', abbr: 'DERR' },
  'Hahn Hall':            { lat: 37.23056, lng: -80.42466, color: '#E5751F', abbr: 'HAHN' },
  'Robeson Hall':         { lat: 37.22755, lng: -80.42360, color: '#508590', abbr: 'ROBE' },
  'Whittemore Hall':      { lat: 37.23087, lng: -80.42231, color: '#CE0058', abbr: 'WHIT' },
  'Goodwin Hall':         { lat: 37.23123, lng: -80.42298, color: '#F5A623', abbr: 'GOOD' },
  'Randolph Hall':        { lat: 37.22786, lng: -80.42223, color: '#8B6DB0', abbr: 'RAND' },
  'Norris Hall':          { lat: 37.22891, lng: -80.42173, color: '#4A90D9', abbr: 'NORR' },
  'Pamplin Hall':         { lat: 37.22753, lng: -80.42130, color: '#D4A843', abbr: 'PAMP' },
  'Surge Space Building': { lat: 37.22665, lng: -80.42650, color: '#6B8E23', abbr: 'SURG' },
  'War Memorial Hall':    { lat: 37.22700, lng: -80.41943, color: '#CD5C5C', abbr: 'WAR' },
  'Shanks Hall':          { lat: 37.22600, lng: -80.42350, color: '#9370DB', abbr: 'SHAN' },
  'Patton Hall':          { lat: 37.22830, lng: -80.41870, color: '#20B2AA', abbr: 'PATT' },
  'Holden Hall':          { lat: 37.22720, lng: -80.42480, color: '#FF6347', abbr: 'HOLD' },
};

// ─────────────────────────────────────────────
// Class Database — VT-style course offerings
// ─────────────────────────────────────────────
const CLASS_DATABASE = {
  'CS 1044': {
    title: 'Intro to Programming in C',
    credits: 3,
    sections: [
      { crn: '17340', location: 'Torgersen Hall',  startTime: '08:00', endTime: '08:50',  days: 'MWF', instructor: 'Dr. Shaffer' },
      { crn: '17341', location: 'McBryde Hall',    startTime: '09:05', endTime: '09:55',  days: 'MWF', instructor: 'Dr. Shaffer' },
      { crn: '17342', location: 'Torgersen Hall',  startTime: '11:15', endTime: '12:30',  days: 'TR',  instructor: 'Dr. Edwards' },
    ],
  },
  'CS 2114': {
    title: 'Software Design & Data Structures',
    credits: 3,
    sections: [
      { crn: '18201', location: 'McBryde Hall',    startTime: '10:10', endTime: '11:00',  days: 'MWF', instructor: 'Dr. Barnette' },
      { crn: '18202', location: 'Torgersen Hall',  startTime: '14:00', endTime: '15:15',  days: 'TR',  instructor: 'Dr. Barnette' },
      { crn: '18203', location: 'Derring Hall',    startTime: '15:30', endTime: '16:45',  days: 'TR',  instructor: 'Dr. Ribbens' },
    ],
  },
  'CS 2505': {
    title: 'Intro to Computer Organization',
    credits: 3,
    sections: [
      { crn: '18301', location: 'Torgersen Hall',  startTime: '09:05', endTime: '09:55',  days: 'MWF', instructor: 'Dr. Back' },
      { crn: '18302', location: 'McBryde Hall',    startTime: '13:00', endTime: '13:50',  days: 'MWF', instructor: 'Dr. Back' },
    ],
  },
  'MATH 1226': {
    title: 'Calculus of a Single Variable',
    credits: 4,
    sections: [
      { crn: '20100', location: 'McBryde Hall',    startTime: '08:00', endTime: '08:50',  days: 'MWF', instructor: 'Dr. Kim' },
      { crn: '20101', location: 'Derring Hall',    startTime: '10:10', endTime: '11:00',  days: 'MWF', instructor: 'Dr. Haskell' },
      { crn: '20102', location: 'Norris Hall',     startTime: '12:30', endTime: '13:45',  days: 'TR',  instructor: 'Dr. Kim' },
    ],
  },
  'MATH 2114': {
    title: 'Intro to Linear Algebra',
    credits: 3,
    sections: [
      { crn: '20200', location: 'McBryde Hall',    startTime: '11:15', endTime: '12:05',  days: 'MWF', instructor: 'Dr. Floyd' },
      { crn: '20201', location: 'Norris Hall',     startTime: '09:30', endTime: '10:45',  days: 'TR',  instructor: 'Dr. Floyd' },
    ],
  },
  'PHYS 2305': {
    title: 'Foundations of Physics',
    credits: 4,
    sections: [
      { crn: '21100', location: 'Robeson Hall',    startTime: '08:00', endTime: '08:50',  days: 'MWF', instructor: 'Dr. Tauber' },
      { crn: '21101', location: 'Robeson Hall',    startTime: '14:00', endTime: '15:15',  days: 'TR',  instructor: 'Dr. Tauber' },
      { crn: '21102', location: 'Derring Hall',    startTime: '16:00', endTime: '17:15',  days: 'TR',  instructor: 'Dr. Pitt' },
    ],
  },
  'ENGL 1106': {
    title: 'First-Year Writing',
    credits: 3,
    sections: [
      { crn: '22100', location: 'Shanks Hall',     startTime: '09:05', endTime: '09:55',  days: 'MWF', instructor: 'Prof. Carter' },
      { crn: '22101', location: 'Shanks Hall',     startTime: '11:15', endTime: '12:30',  days: 'TR',  instructor: 'Prof. Lee' },
      { crn: '22102', location: 'War Memorial Hall', startTime: '14:00', endTime: '14:50', days: 'MWF', instructor: 'Prof. Carter' },
    ],
  },
  'ECE 2514': {
    title: 'Intro to Computer Engineering',
    credits: 3,
    sections: [
      { crn: '23100', location: 'Whittemore Hall',  startTime: '10:10', endTime: '11:00',  days: 'MWF', instructor: 'Dr. Jones' },
      { crn: '23101', location: 'Goodwin Hall',     startTime: '12:30', endTime: '13:45',  days: 'TR',  instructor: 'Dr. Ha' },
    ],
  },
  'ENGE 1215': {
    title: 'Foundations of Engineering',
    credits: 2,
    sections: [
      { crn: '24100', location: 'Goodwin Hall',     startTime: '08:00', endTime: '08:50',  days: 'TR',  instructor: 'Dr. Baird' },
      { crn: '24101', location: 'Hahn Hall',        startTime: '10:10', endTime: '11:00',  days: 'MWF', instructor: 'Dr. Baird' },
      { crn: '24102', location: 'Whittemore Hall',  startTime: '14:00', endTime: '15:15',  days: 'TR',  instructor: 'Dr. Baird' },
    ],
  },
  'BIT 2405': {
    title: 'Quantitative Methods',
    credits: 3,
    sections: [
      { crn: '25100', location: 'Pamplin Hall',     startTime: '09:30', endTime: '10:45',  days: 'TR',  instructor: 'Dr. Ragsdale' },
      { crn: '25101', location: 'Pamplin Hall',     startTime: '11:00', endTime: '12:15',  days: 'TR',  instructor: 'Dr. Ragsdale' },
    ],
  },
  'ACIS 1504': {
    title: 'Intro to Business Info Systems',
    credits: 3,
    sections: [
      { crn: '26100', location: 'Pamplin Hall',     startTime: '12:30', endTime: '13:45',  days: 'TR',  instructor: 'Dr. Pence' },
      { crn: '26101', location: 'Pamplin Hall',     startTime: '15:30', endTime: '16:45',  days: 'TR',  instructor: 'Dr. Pence' },
    ],
  },
  'ISE 2014': {
    title: 'Engineering Economy',
    credits: 3,
    sections: [
      { crn: '27100', location: 'Patton Hall',      startTime: '10:10', endTime: '11:00',  days: 'MWF', instructor: 'Dr. Koelling' },
      { crn: '27101', location: 'Patton Hall',      startTime: '14:00', endTime: '15:15',  days: 'TR',  instructor: 'Dr. Koelling' },
    ],
  },
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const timeToMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const dayMap = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri' };
const formatDays = (days) => days.split('').map(d => dayMap[d] || d).join(', ');

const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const R = 3959;
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const distanceToWalkTime = (miles) => Math.round(miles / 0.05);

const classesOverlap = (c1, c2) => {
  const days1 = c1.days.split('');
  const days2 = c2.days.split('');
  if (!days1.some(d => days2.includes(d))) return false;
  return timeToMinutes(c1.startTime) < timeToMinutes(c2.endTime) && timeToMinutes(c2.startTime) < timeToMinutes(c1.endTime);
};

const calculateMetrics = (schedule) => {
  if (schedule.length === 0) return { totalGap: 0, totalDistance: 0, totalWalkTime: 0, totalCredits: 0 };
  const sorted = [...schedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  let totalGap = 0, totalDistance = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    totalGap += Math.max(0, timeToMinutes(sorted[i + 1].startTime) - timeToMinutes(sorted[i].endTime));
    totalDistance += calculateDistance(LOCATIONS[sorted[i].location], LOCATIONS[sorted[i + 1].location]);
  }
  return { totalGap, totalDistance, totalWalkTime: distanceToWalkTime(totalDistance), totalCredits: schedule.reduce((s, c) => s + (c.credits || 3), 0) };
};

// ─────────────────────────────────────────────
// Optimizer — brute-force all section combos
// ─────────────────────────────────────────────
const findBestSchedule = (courseKeys) => {
  const courseSections = courseKeys.map(key => {
    const course = CLASS_DATABASE[key];
    if (!course) return null;
    return course.sections.map((sec, idx) => ({
      courseKey: key, title: course.title, credits: course.credits,
      sectionIndex: idx, sectionLabel: String(idx + 1).padStart(2, '0'), ...sec,
    }));
  }).filter(Boolean);
  if (courseSections.length === 0) return null;

  let bestCombo = null, bestScore = Infinity;
  const generate = (idx, current) => {
    if (idx === courseSections.length) {
      for (let i = 0; i < current.length; i++)
        for (let j = i + 1; j < current.length; j++)
          if (classesOverlap(current[i], current[j])) return;
      const { totalGap, totalDistance } = calculateMetrics(current);
      const score = totalDistance * 1000 + totalGap;
      if (score < bestScore) { bestScore = score; bestCombo = [...current]; }
      return;
    }
    for (const section of courseSections[idx]) { current.push(section); generate(idx + 1, current); current.pop(); }
  };
  generate(0, []);
  return bestCombo;
};

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, unit }) => (
  <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className="text-3xl font-bold text-white">{value}<span className="text-lg text-gray-400 ml-1 font-normal">{unit}</span></p>
  </div>
);

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
export default function App() {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCatalog, setShowCatalog] = useState(true);
  const [error, setError] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // ── Map init ──
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false }).setView([37.2284, -80.4234], 16);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OSM &copy; CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => { map.remove(); mapInstanceRef.current = null; };
  }, []);

  // ── Update map markers ──
  const updateMap = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    markersRef.current.forEach(item => map.removeLayer(item));
    markersRef.current = [];
    if (schedule.length === 0) return;

    const sorted = [...schedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    const bounds = [];
    sorted.forEach((cls, idx) => {
      const loc = LOCATIONS[cls.location];
      if (!loc) return;
      bounds.push([loc.lat, loc.lng]);
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 12, fillColor: loc.color, color: '#fff', weight: 2, opacity: 0.9, fillOpacity: 0.85,
      }).addTo(map);
      marker.bindPopup(`<div style="font-size:13px;padding:4px 2px;"><div style="font-weight:700;font-size:15px;color:#E87722;margin-bottom:4px;">${cls.courseKey}</div><div style="color:#ccc;margin-bottom:6px;">${cls.title}</div><div style="color:#aaa;font-size:12px;">🕐 ${formatTime(cls.startTime)} – ${formatTime(cls.endTime)}</div><div style="color:#aaa;font-size:12px;margin-top:2px;">📍 ${cls.location} · 📅 ${formatDays(cls.days)}</div><div style="color:#888;font-size:11px;margin-top:4px;">👤 ${cls.instructor}</div></div>`);
      const label = L.divIcon({
        className: 'custom-label',
        html: `<div style="background:#861F41;color:#fff;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;border:2px solid #E87722;box-shadow:0 2px 8px rgba(0,0,0,0.4);">${idx + 1}</div>`,
        iconSize: [20, 20], iconAnchor: [10, -8],
      });
      const labelMarker = L.marker([loc.lat, loc.lng], { icon: label }).addTo(map);
      markersRef.current.push(marker, labelMarker);
    });

    if (sorted.length > 1) {
      const polyline = L.polyline(sorted.map(c => { const l = LOCATIONS[c.location]; return [l.lat, l.lng]; }), {
        color: '#E87722', weight: 3, opacity: 0.8, dashArray: '8, 6',
      }).addTo(map);
      markersRef.current.push(polyline);
    }
    if (bounds.length > 0) map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
  }, [schedule]);

  useEffect(() => { updateMap(); }, [updateMap]);

  const toggleCourse = (key) => { setError(''); setSelectedCourses(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]); };

  const handleOptimize = () => {
    setError('');
    if (selectedCourses.length === 0) { setError('Select at least one course to optimize.'); return; }
    setOptimizing(true);
    setTimeout(() => {
      const best = findBestSchedule(selectedCourses);
      if (!best) setError('No valid schedule found — all combinations have time conflicts. Try removing a course.');
      else setSchedule(best);
      setOptimizing(false);
    }, 600);
  };

  const metrics = useMemo(() => calculateMetrics(schedule), [schedule]);
  const sortedSchedule = useMemo(() => [...schedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)), [schedule]);

  const filteredCourses = Object.entries(CLASS_DATABASE).filter(([key, course]) => {
    const q = searchQuery.toLowerCase();
    return key.toLowerCase().includes(q) || course.title.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c1a] via-[#14112a] to-[#0f0c1a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-800/50 bg-[#0f0c1a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#861F41] to-[#E87722] flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Smart<span className="text-[#E87722]">Scheduler</span></h1>
              <p className="text-xs text-gray-500 -mt-0.5">Virginia Tech Schedule Optimizer</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Sparkles className="w-3.5 h-3.5 text-[#E87722]" />
            <span>Ut Prosim — That I May Serve</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {/* Course Selector */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/40 overflow-hidden">
              <div className="p-6 pb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-1">
                  <BookOpen className="w-5 h-5 text-[#E87722]" />Select Your Courses
                </h2>
                <p className="text-sm text-gray-400">Choose courses and we'll find the best section combination with minimal walking.</p>
              </div>
              <div className="px-6 pb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowCatalog(true); }} onFocus={() => setShowCatalog(true)}
                    placeholder="Search courses — e.g. CS 2114, Linear Algebra..."
                    className="w-full bg-gray-900/60 border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E87722]/50 focus:ring-1 focus:ring-[#E87722]/20 transition-all" />
                  {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>}
                </div>
              </div>
              {selectedCourses.length > 0 && (
                <div className="px-6 pb-4 flex flex-wrap gap-2">
                  {selectedCourses.map(key => (
                    <button key={key} onClick={() => toggleCourse(key)}
                      className="inline-flex items-center gap-1.5 bg-[#861F41]/30 border border-[#861F41]/50 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#861F41]/50 transition-all group">
                      {key}<X className="w-3 h-3 text-gray-400 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              )}
              {showCatalog && (
                <div className="border-t border-gray-700/30 max-h-72 overflow-y-auto">
                  {filteredCourses.map(([key, course]) => {
                    const isSel = selectedCourses.includes(key);
                    return (
                      <button key={key} onClick={() => toggleCourse(key)}
                        className={`w-full text-left px-6 py-3.5 flex items-center justify-between hover:bg-gray-700/30 transition-all border-b border-gray-800/30 last:border-b-0 ${isSel ? 'bg-[#861F41]/15' : ''}`}>
                        <div>
                          <span className="font-semibold text-sm">{key}</span>
                          <span className="text-gray-400 text-sm ml-2">— {course.title}</span>
                          <div className="text-xs text-gray-500 mt-0.5">{course.credits} credits · {course.sections.length} section{course.sections.length > 1 ? 's' : ''}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSel ? 'bg-[#E87722] border-[#E87722]' : 'border-gray-600'}`}>
                          {isSel && <span className="text-white text-xs font-bold">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                  {filteredCourses.length === 0 && <div className="px-6 py-8 text-center text-gray-500 text-sm">No courses match your search.</div>}
                </div>
              )}
              <div className="p-6 pt-4 border-t border-gray-700/30">
                <button onClick={handleOptimize} disabled={optimizing || selectedCourses.length === 0}
                  className="w-full bg-gradient-to-r from-[#861F41] to-[#6B1835] hover:from-[#E87722] hover:to-[#861F41] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                  {optimizing ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Finding Best Schedule...</>) : (<><Zap className="w-5 h-5" />Optimize Schedule ({selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''})</>)}
                </button>
                {error && <div className="mt-3 p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 flex items-start gap-2 text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span></div>}
              </div>
            </div>

            {/* Stats */}
            {schedule.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
                <StatCard icon={CalendarDays} label="Classes" value={schedule.length} unit="" />
                <StatCard icon={GraduationCap} label="Credits" value={metrics.totalCredits} unit="cr" />
                <StatCard icon={Footprints} label="Walking" value={metrics.totalDistance.toFixed(2)} unit="mi" />
                <StatCard icon={Timer} label="Gap Time" value={metrics.totalGap} unit="min" />
              </div>
            )}

            {/* Schedule / Walking tabs */}
            {schedule.length > 0 && (
              <div className="animate-fade-in">
                <div className="flex gap-1 bg-gray-800/40 rounded-xl p-1 mb-4 border border-gray-700/30">
                  {[{ key: 'schedule', label: 'Schedule', icon: CalendarDays }, { key: 'walking', label: 'Walking Route', icon: Route }].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-[#861F41] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-gray-700/30'}`}>
                      <tab.icon className="w-4 h-4" />{tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'schedule' && (
                  <div className="space-y-3 stagger-children">
                    {sortedSchedule.map((cls, idx) => {
                      const loc = LOCATIONS[cls.location];
                      const nextCls = sortedSchedule[idx + 1];
                      const gap = nextCls ? Math.max(0, timeToMinutes(nextCls.startTime) - timeToMinutes(cls.endTime)) : 0;
                      const dist = nextCls ? calculateDistance(LOCATIONS[cls.location], LOCATIONS[nextCls.location]) : 0;
                      const walkMins = distanceToWalkTime(dist);
                      return (
                        <div key={cls.crn}>
                          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/40 hover:border-gray-600/60 transition-all hover:shadow-lg"
                            style={{ borderLeftWidth: '4px', borderLeftColor: loc?.color || '#E87722' }}>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-lg bg-[#861F41]/30 flex items-center justify-center text-xs font-bold text-[#E87722]">{idx + 1}</span>
                                  <h3 className="font-bold text-lg">{cls.courseKey}</h3>
                                </div>
                                <p className="text-sm text-gray-400 mt-0.5 ml-8">{cls.title}</p>
                              </div>
                              <span className="text-xs bg-gray-700/60 px-2.5 py-1 rounded-lg text-gray-300 font-medium">Sec {cls.sectionLabel} · CRN {cls.crn}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-300 ml-8">
                              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#E87722]" />{formatTime(cls.startTime)} – {formatTime(cls.endTime)}</div>
                              <div className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-[#E87722]" />{formatDays(cls.days)}</div>
                              <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-[#E87722]" />{cls.location}</div>
                              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-500" /><span className="text-gray-500">{cls.instructor}</span></div>
                            </div>
                          </div>
                          {nextCls && (
                            <div className="flex items-center gap-3 py-2 pl-10">
                              <div className="w-px h-6 bg-gradient-to-b from-[#E87722]/60 to-transparent" />
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Footprints className="w-3.5 h-3.5" /><span>{dist.toFixed(2)} mi · ~{walkMins} min walk</span>
                                <span className="text-gray-600">·</span><span>{gap} min gap</span>
                                {gap > 0 && walkMins > 0 && gap < walkMins && <span className="text-red-400 font-medium">⚠ tight!</span>}
                              </div>
                              <ArrowRight className="w-3 h-3 text-gray-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'walking' && (
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/40">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Route className="w-5 h-5 text-[#E87722]" />Your Walking Route</h3>
                    <div className="space-y-4">
                      {sortedSchedule.map((cls, idx) => {
                        const nextCls = sortedSchedule[idx + 1];
                        const dist = nextCls ? calculateDistance(LOCATIONS[cls.location], LOCATIONS[nextCls.location]) : 0;
                        const walkMins = distanceToWalkTime(dist);
                        return (
                          <div key={cls.crn}>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: LOCATIONS[cls.location]?.color || '#E87722', color: '#fff' }}>{idx + 1}</div>
                              <div>
                                <p className="font-medium">{cls.location}</p>
                                <p className="text-xs text-gray-400">{cls.courseKey} · {formatTime(cls.startTime)} – {formatTime(cls.endTime)}</p>
                              </div>
                            </div>
                            {nextCls && (
                              <div className="ml-4 border-l-2 border-dashed border-[#E87722]/40 pl-6 py-3">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="bg-gray-700/50 px-3 py-1 rounded-lg text-gray-300">🚶 {dist.toFixed(2)} mi</span>
                                  <span className="bg-gray-700/50 px-3 py-1 rounded-lg text-gray-300">⏱ ~{walkMins} min</span>
                                  {walkMins > 10 && <span className="bg-red-900/30 px-3 py-1 rounded-lg text-red-300 text-xs">Long walk!</span>}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700/30 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total daily walking</span>
                      <span className="font-bold text-[#E87722] text-lg">{metrics.totalDistance.toFixed(2)} mi · ~{metrics.totalWalkTime} min</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty state */}
            {schedule.length === 0 && (
              <div className="bg-gray-800/20 rounded-2xl border border-dashed border-gray-700/40 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#861F41]/20 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-[#861F41]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No schedule yet</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">Select your courses above and click <span className="text-[#E87722] font-medium">Optimize Schedule</span> to find the best combination with minimal walking.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Map */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/40 overflow-hidden">
                <div className="p-5 pb-3">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-5 h-5 text-[#E87722]" />Campus Map</h2>
                  <p className="text-xs text-gray-500 mt-1">Virginia Tech · Blacksburg, VA</p>
                </div>
                <div ref={mapRef} className="w-full h-[450px]" />
                {schedule.length > 0 && (
                  <div className="p-4 border-t border-gray-700/30">
                    <div className="flex flex-wrap gap-2">
                      {sortedSchedule.map((cls, idx) => {
                        const loc = LOCATIONS[cls.location];
                        return (
                          <div key={cls.crn} className="flex items-center gap-1.5 text-xs bg-gray-900/60 px-2.5 py-1.5 rounded-lg border border-gray-700/40">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc?.color }} />
                            <span className="font-medium">{idx + 1}.</span>
                            <span className="text-gray-400">{loc?.abbr || cls.location}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick info */}
              <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/40 p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3"><Sparkles className="w-4 h-4 text-[#E87722]" />How It Works</h3>
                <ul className="text-xs text-gray-400 space-y-2">
                  <li className="flex gap-2"><span className="text-[#E87722] font-bold">1.</span> Select courses you want to take</li>
                  <li className="flex gap-2"><span className="text-[#E87722] font-bold">2.</span> Click Optimize — we test every section combo</li>
                  <li className="flex gap-2"><span className="text-[#E87722] font-bold">3.</span> Get the schedule with least walking & no conflicts</li>
                  <li className="flex gap-2"><span className="text-[#E87722] font-bold">4.</span> View your route on the interactive campus map</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
          <p>SmartScheduler · CS 3704 Group Project · Virginia Tech</p>
          <p className="mt-2 sm:mt-0">Built with React, Tailwind CSS & Leaflet</p>
        </div>
      </footer>
    </div>
  );
}
