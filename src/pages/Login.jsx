import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CollegeLogo } from '../components/CollegeLogo';
import {
  ADMIN_ROLES,
  ADMIN_DEPARTMENTS,
  TEACHER_DEPARTMENTS,
  STUDENT_CLASSES,
  STUDENT_STREAMS
} from '../data/authOptions';
import {
  ArrowRight,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen,
  KeyRound,
  X,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const Login = () => {
  const { login, registerUser, apiUnavailable } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');
  // Role: 'student', 'teacher', 'admin'
  const [role, setRole] = useState('student');

  // Shared / Alert Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password Visibility Toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // LOGIN STATE
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginStudentClass, setLoginStudentClass] = useState(STUDENT_CLASSES[2] || 'TYCS');
  const [loginAdminRole, setLoginAdminRole] = useState(ADMIN_ROLES[0] || 'Principal');
  const [loginAdminDepartment, setLoginAdminDepartment] = useState(ADMIN_DEPARTMENTS[0] || 'Administration');
  const [loginTeacherDepartment, setLoginTeacherDepartment] = useState(TEACHER_DEPARTMENTS[0] || 'Computer Science');

  // REGISTRATION STATE
  const [regRollNo, setRegRollNo] = useState('');
  const [regFacultyId, setRegFacultyId] = useState('');
  const [regAdminId, setRegAdminId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentClass, setRegStudentClass] = useState(STUDENT_CLASSES[0] || 'FYCS');
  const [regStream, setRegStream] = useState(STUDENT_STREAMS[0] || 'BSc CS');
  const [regDepartment, setRegDepartment] = useState(TEACHER_DEPARTMENTS[0] || 'Computer Science');
  const [regAdminRole, setRegAdminRole] = useState(ADMIN_ROLES[0] || 'Principal');
  const [regSecurityKey, setRegSecurityKey] = useState('');
  const [showRegSecurityKey, setShowRegSecurityKey] = useState(false);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // FORGOT PASSWORD MODAL STATE
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Role Switch Handler
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
    setSuccessMsg('');
    setLoginIdentifier('');
    setLoginPassword('');
    setRegSecurityKey('');
    if (newRole === 'student') {
      setLoginStudentClass(STUDENT_CLASSES[2] || 'TYCS');
    } else if (newRole === 'teacher') {
      setLoginTeacherDepartment(TEACHER_DEPARTMENTS[0] || 'Computer Science');
    } else if (newRole === 'admin') {
      setLoginAdminRole(ADMIN_ROLES[0] || 'Principal');
      setLoginAdminDepartment(ADMIN_DEPARTMENTS[0] || 'Administration');
    }
  };

  // Helper: Email Validation Regex
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // HANDLE LOGIN SUBMIT
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg(
        role === 'student'
          ? 'Please enter your Roll Number or Email ID'
          : role === 'teacher'
          ? 'Please enter your Faculty Staff ID or Email ID'
          : 'Please enter your Admin ID or Email ID'
      );
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    const extraData = {
      studentClass: loginStudentClass,
      adminRole: loginAdminRole,
      department: role === 'admin' ? loginAdminDepartment : role === 'teacher' ? loginTeacherDepartment : undefined
    };

    const result = await login(role, loginIdentifier, loginPassword, extraData);
    if (!result.success) {
      setErrorMsg(result.message || 'Invalid login details. Please try again.');
    }
  };

  // HANDLE REGISTER SUBMIT
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Field Validations
    if (!regFullName.trim() || regFullName.trim().split(' ').length < 1) {
      setErrorMsg('Please enter your Full Name (e.g. Aryan Kanekar).');
      return;
    }

    if (!regEmail.trim() || !isValidEmail(regEmail.trim())) {
      setErrorMsg('Please enter a valid Email ID (e.g. student@rkt.edu.in).');
      return;
    }

    // Role-specific ID & Security Passkey Checks
    if (role === 'student' && !regRollNo.trim()) {
      setErrorMsg('Please enter your unique Roll Number / Student ID.');
      return;
    }
    if (role === 'teacher' && !regFacultyId.trim()) {
      setErrorMsg('Please enter your unique Faculty ID.');
      return;
    }
    if (role === 'admin') {
      if (!regAdminId.trim()) {
        setErrorMsg('Please enter your unique Admin ID.');
        return;
      }
    }

    // Password Checks
    if (regPassword.length > 1024 || regPassword.trim().length < 6) {
      setErrorMsg('Password must be 6 to 1024 characters after trimming.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match! Please check and confirm your password.');
      return;
    }

    // Construct Payload
    const newUserPayload = {
      role,
      fullName: regFullName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      rollNo: regRollNo.trim(),
      facultyId: regFacultyId.trim(),
      adminId: regAdminId.trim(),
      studentClass: regStudentClass,
      stream: regStream,
      department: regDepartment,
      adminRole: regAdminRole,
      securityKey: regSecurityKey.trim()
    };

    const res = await registerUser(newUserPayload);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      // Switch back to login mode and fill credentials
      setMode('login');
      if (role === 'student') {
        setLoginIdentifier(regRollNo.trim() || regEmail.trim());
        setLoginStudentClass(regStudentClass);
      } else if (role === 'teacher') {
        setLoginIdentifier(regFacultyId.trim() || regEmail.trim());
        setLoginTeacherDepartment(regDepartment);
      } else {
        setLoginIdentifier(regAdminId.trim() || regEmail.trim());
        setLoginAdminRole(regAdminRole);
        setLoginAdminDepartment(regDepartment);
      }
      setLoginPassword(regPassword);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-gray-800 font-sans relative overflow-x-hidden">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-red-200/40 via-amber-100/30 to-transparent blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <CollegeLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-red-600">
              OurCampus Connect
            </span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              R.K. Talreja College
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-gray-500">
          <span className="flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-red-600" />
            Ulhasnagar-3
          </span>
          <span>•</span>
          <span className="text-red-600 font-bold">Arts, Science & Commerce</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative z-10">
        {/* Glowing Center Emblem */}
        <div className="mb-4 relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-2 shadow-xl border-4 border-red-600 flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105">
            <CollegeLogo size="lg" />
          </div>
          <div className="absolute -inset-2 rounded-full border-2 border-red-500/60 animate-ping opacity-30"></div>
          <div className="absolute -inset-4 rounded-full bg-red-500/10 blur-md"></div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100/90 transition-all duration-300">
          {/* Top Title & Mode Switcher */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {mode === 'login' ? 'Sign In to Portal' : 'Create New Account'}
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Official Campus Portal • R.K. Talreja College
            </p>

            {/* Login / Register Toggle Pills */}
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl mt-3 border border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Role Selection Tabs (Student / Teacher / Admin) */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-2xl mb-5 border border-gray-200/80">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                role === 'student'
                  ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <GraduationCap className="w-4 h-4 mb-0.5" />
              Student
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                role === 'teacher'
                  ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <UserCheck className="w-4 h-4 mb-0.5" />
              Teacher
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                role === 'admin'
                  ? 'bg-red-600 text-white shadow-md scale-[1.02]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-0.5" />
              Principal
            </button>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {apiUnavailable && !errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Authentication service is unavailable. Please try again later.</span>
            </div>
          )}

          {/* ================= MODE 1: LOGIN FORM ================= */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Roll No / Faculty ID / Admin ID or Email */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-red-600" />
                  {role === 'student'
                    ? 'Roll Number / Email ID'
                    : role === 'teacher'
                    ? 'Faculty Staff ID / Email ID'
                    : 'Admin ID / Email ID'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Class Dropdown for Student Login */}
              {role === 'student' && (
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-red-600" />
                    Class
                  </label>
                  <select
                    value={loginStudentClass}
                    onChange={(e) => setLoginStudentClass(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                  >
                    {STUDENT_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department Dropdown for Teacher Login */}
              {role === 'teacher' && (
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-red-600" />
                    Department
                  </label>
                  <select
                    value={loginTeacherDepartment}
                    onChange={(e) => setLoginTeacherDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                  >
                    {TEACHER_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Role & Department Dropdowns for Admin Login (Exact match with Register) */}
              {role === 'admin' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                      Role
                    </label>
                    <select
                      value={loginAdminRole}
                      onChange={(e) => setLoginAdminRole(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-800"
                    >
                      {ADMIN_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-purple-600" />
                      Department
                    </label>
                    <select
                      value={loginAdminDepartment}
                      onChange={(e) => setLoginAdminDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-bold text-gray-800"
                    >
                      {ADMIN_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Password with Show / Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    maxLength={1024}
                    className="w-full pl-4 pr-11 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full mt-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200 flex items-center justify-center gap-2 group text-sm cursor-pointer"
              >
                Sign In to {role === 'admin' ? 'PRINCIPAL' : role.toUpperCase()} Portal
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            /* ================= MODE 2: REGISTRATION FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  Full Name (Name + Surname)
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                  required
                />
              </div>

              {/* Email ID */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  Email ID
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                  required
                />
              </div>

              {/* STUDENT FIELDS */}
              {role === 'student' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                      Roll Number / Student ID (Unique)
                    </label>
                    <input
                      type="text"
                      value={regRollNo}
                      onChange={(e) => setRegRollNo(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">
                        Class
                      </label>
                      <select
                        value={regStudentClass}
                        onChange={(e) => setRegStudentClass(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                      >
                        {STUDENT_CLASSES.map((cls) => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">
                        Stream
                      </label>
                      <select
                        value={regStream}
                        onChange={(e) => setRegStream(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                      >
                        {STUDENT_STREAMS.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* TEACHER FIELDS */}
              {role === 'teacher' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                      Faculty ID (Unique)
                    </label>
                    <input
                      type="text"
                      value={regFacultyId}
                      onChange={(e) => setRegFacultyId(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-red-600" />
                      Department
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                    >
                      {TEACHER_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <p className="text-[11px] text-amber-800/90 font-medium">
                    Faculty access is available after Principal approval.
                  </p>
                </>
              )}

              {/* ADMIN FIELDS */}
              {role === 'admin' && (
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-red-600" />
                      Admin ID (Unique)
                    </label>
                    <input
                      type="text"
                      value={regAdminId}
                      onChange={(e) => setRegAdminId(e.target.value)}
                      className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">
                        Role
                      </label>
                      <select
                        value={regAdminRole}
                        onChange={(e) => setRegAdminRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                      >
                        {ADMIN_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase mb-1">
                        Department
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-bold text-gray-800"
                      >
                        {ADMIN_DEPARTMENTS.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Secret Admin Master PIN */}
                  <div className="bg-slate-50 border border-slate-300 rounded-xl p-3">
                    <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                        Admin Master Security PIN
                      </span>
                      <span className="text-[10px] text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                        Executive Only
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegSecurityKey ? 'text' : 'password'}
                        value={regSecurityKey}
                        onChange={(e) => setRegSecurityKey(e.target.value)}
                        className="w-full pl-3.5 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-semibold text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegSecurityKey(!showRegSecurityKey)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                      >
                        {showRegSecurityKey ? (
                          <EyeOff className="w-4 h-4 text-red-600" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-1.5">
                      🛡️ Restricted to authorized college executives and master IT admins.
                    </p>
                  </div>
                </>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-red-600" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    maxLength={1024}
                    className="w-full pl-4 pr-11 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-red-600" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    maxLength={1024}
                    className="w-full pl-4 pr-11 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 outline-none font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full mt-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all duration-200 flex items-center justify-center gap-2 group text-sm cursor-pointer"
              >
                Register as {role.toUpperCase()}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* Form End */}
        </div>
      </main>

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Reset Your Password</h3>
                <p className="text-xs text-gray-500 font-medium">Account recovery information</p>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium leading-relaxed text-amber-900">
              Self-service password recovery is currently unavailable because no verified recovery provider is configured. Contact your college administrator for identity-verified assistance. Do not share your current password.
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs font-medium text-gray-500 relative z-10 flex flex-col items-center gap-1">
        <p className="font-semibold text-gray-600 italic">"DUTY IS DELIGHT"</p>
        <p className="text-[11px] text-gray-400">
          © 2026 OurCampus Connect • R.K. Talreja College of Arts, Science & Commerce, Ulhasnagar-3
        </p>
      </footer>
    </div>
  );
};

export default Login;
