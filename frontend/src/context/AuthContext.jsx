import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// Verified Student Database Accounts
export const STUDENT_DATABASE = [
  {
    user_id: 'usr-stu-24bcb7220',
    login_id: '24bcb7220',
    registration_no: '24bcb7220',
    name: 'Bharath',
    email: 'bharath@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72220'
  },
  {
    user_id: 'usr-stu-24bcb7251',
    login_id: '24bcb7251',
    registration_no: '24bcb7251',
    name: 'Abhiram',
    email: 'abhiram@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72251'
  },
  {
    user_id: 'usr-stu-24bcb7053',
    login_id: '24bcb7053',
    registration_no: '24bcb7053',
    name: 'Aaron',
    email: 'aaron@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72053'
  },
  {
    user_id: 'usr-stu-24bcb7266',
    login_id: '24bcb7266',
    registration_no: '24bcb7266',
    name: 'Balaji',
    email: 'balaji@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72266'
  },
  {
    user_id: 'usr-admin-24bcb7230',
    login_id: '24bcb7230',
    registration_no: '24bcb7230',
    name: 'Koushik',
    email: 'koushik@campus.edu',
    role: 'admin',
    userType: 'admin',
    department: 'Facilities & Estate Office',
    phone: '+91 98765 72230',
    isAdmin: true
  }
];

const PRESET_USERS = {
  // Default student is Bharath
  student: STUDENT_DATABASE[0],
  requester: STUDENT_DATABASE[0],
  bharath: STUDENT_DATABASE[0],
  '24bcb7220': STUDENT_DATABASE[0],
  abhiram: STUDENT_DATABASE[1],
  '24bcb7251': STUDENT_DATABASE[1],
  aaron: STUDENT_DATABASE[2],
  '24bcb7053': STUDENT_DATABASE[2],
  balaji: STUDENT_DATABASE[3],
  '24bcb7266': STUDENT_DATABASE[3],
  koushik: STUDENT_DATABASE[4],
  '24bcb7230': STUDENT_DATABASE[4],
  // Admin login user is Koushik
  admin: STUDENT_DATABASE[4],
  staff: {
    user_id: 'usr-faculty-1',
    login_id: 'STF8820',
    name: 'Prof. Ramesh Rao',
    email: 'ramesh.rao@campus.edu',
    role: 'requester',
    userType: 'faculty',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 22222'
  },
  faculty: {
    user_id: 'usr-faculty-1',
    login_id: 'STF8820',
    name: 'Prof. Ramesh Rao',
    email: 'ramesh.rao@campus.edu',
    role: 'requester',
    userType: 'faculty',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 22222'
  },
  technician: {
    user_id: 'usr-tech-1',
    technician_id: 'T01',
    login_id: 'TECH01',
    name: 'Rajesh Kumar',
    email: 'tech.rajesh@campus.edu',
    role: 'technician',
    userType: 'technician',
    department: 'HVAC Services',
    skill: 'HVAC Maintenance',
    phone: '+91 98765 44441'
  },
  management: {
    user_id: 'usr-mgmt-1',
    login_id: 'DIR001',
    name: 'Dr. K. Ramanathan',
    email: 'director@campus.edu',
    role: 'management',
    userType: 'management',
    department: 'Office of the Director',
    phone: '+91 98765 99999'
  }
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Check saved session in localStorage
    try {
      const saved = localStorage.getItem('agy_campus_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore JSON parse error
    }
    return null;
  });

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agy_campus_user', JSON.stringify(currentUser));
      refreshNotificationCount();
    } else {
      localStorage.removeItem('agy_campus_user');
      setNotificationCount(0);
    }
  }, [currentUser]);

  const refreshNotificationCount = async () => {
    if (!currentUser?.user_id) return;
    try {
      const notifs = await api.getNotifications(currentUser.user_id);
      const unread = notifs.filter(n => !n.is_read).length;
      setNotificationCount(unread);
    } catch (err) {
      // quiet fallback in case backend is loading
    }
  };

  const switchRole = (roleKey) => {
    const key = (roleKey || '').toLowerCase();
    if (PRESET_USERS[key]) {
      setCurrentUser(PRESET_USERS[key]);
    }
  };

  const login = async (identifier, password, preferredRole = null) => {
    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    // 1. Try Backend API login
    try {
      const res = await api.login(cleanId, cleanPass);
      if (res && res.user) {
        let userToSet = res.user;
        // If Koushik logged in under student view or admin view
        if (userToSet.name === 'Koushik' || userToSet.registration_no === '24bcb7230') {
          if (preferredRole === 'student') {
            userToSet = { ...userToSet, role: 'requester', userType: 'student' };
          } else {
            userToSet = { ...userToSet, role: 'admin', userType: 'admin' };
          }
        }
        setCurrentUser(userToSet);
        return userToSet;
      }
    } catch (apiErr) {
      // If API returned a 401 with explicit password error, throw it directly
      if (apiErr.message && (apiErr.message.includes('Invalid password') || apiErr.message.includes('password'))) {
        throw apiErr;
      }
      // If server unreachable, fallback to client-side database
      console.warn('Backend login unavailable, evaluating student database locally:', apiErr.message);
    }

    // 2. Client-Side Fallback / Offline Validation
    const idLower = cleanId.toLowerCase();
    const matchedStudent = STUDENT_DATABASE.find(
      s => s.name.toLowerCase() === idLower ||
           s.registration_no.toLowerCase() === idLower ||
           s.email.toLowerCase() === idLower ||
           s.login_id.toLowerCase() === idLower
    );

    if (matchedStudent) {
      // Validate reg.no password
      const isPassValid = 
        cleanPass.toLowerCase() === matchedStudent.registration_no.toLowerCase() ||
        cleanPass === 'password123' ||
        cleanPass === 'campus123';

      if (!isPassValid) {
        throw new Error(`Incorrect password for ${matchedStudent.name}. Please enter registration number (${matchedStudent.registration_no}) as password.`);
      }

      let userObj = { ...matchedStudent };
      if (matchedStudent.name === 'Koushik' || matchedStudent.registration_no === '24bcb7230') {
        if (preferredRole === 'student') {
          userObj.role = 'requester';
          userObj.userType = 'student';
        } else {
          userObj.role = 'admin';
          userObj.userType = 'admin';
        }
      }

      setCurrentUser(userObj);
      return userObj;
    }

    // 3. Fallback for staff, technician, admin demo presets
    if (PRESET_USERS[idLower]) {
      const preset = PRESET_USERS[idLower];
      if (cleanPass === 'password123' || cleanPass === 'campus123' || cleanPass.toLowerCase() === (preset.registration_no || '').toLowerCase()) {
        setCurrentUser(preset);
        return preset;
      }
      throw new Error(`Invalid password for ${preset.name || cleanId}. Default demo password is "password123".`);
    }

    throw new Error('User not found. Please enter your name (Bharath, Abhiram, Aaron, Balaji, Koushik) or registration number.');
  };

  const logout = () => {
    localStorage.removeItem('agy_campus_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      switchRole,
      login,
      logout,
      notificationCount,
      refreshNotificationCount,
      presetUsers: PRESET_USERS,
      studentDatabase: STUDENT_DATABASE
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
