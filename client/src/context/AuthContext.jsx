import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const PRESET_USERS = {
  student: {
    user_id: 'usr-student-1',
    login_id: 'STU1001',
    name: 'Rohan Sharma',
    email: 'student@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Business Systems',
    phone: '+91 98765 11111'
  },
  requester: {
    user_id: 'usr-student-1',
    login_id: 'STU1001',
    name: 'Rohan Sharma',
    email: 'student@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Business Systems',
    phone: '+91 98765 11111'
  },
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
  admin: {
    user_id: 'usr-admin-1',
    login_id: 'ADM001',
    name: 'Dr. Sarah Jenkins',
    email: 'admin@campus.edu',
    role: 'admin',
    userType: 'admin',
    department: 'Facilities & Estate Office',
    phone: '+91 98765 43210'
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
    const saved = localStorage.getItem('agy_campus_user');
    return saved ? JSON.parse(saved) : PRESET_USERS.admin; // Default to Admin for full inspection
  });

  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('agy_campus_user', JSON.stringify(currentUser));
      refreshNotificationCount();
    }
  }, [currentUser]);

  const refreshNotificationCount = async () => {
    if (!currentUser?.user_id) return;
    try {
      const notifs = await api.getNotifications(currentUser.user_id);
      const unread = notifs.filter(n => !n.is_read).length;
      setNotificationCount(unread);
    } catch (err) {
      console.warn('Failed to load notifications count', err);
    }
  };

  const switchRole = (roleKey) => {
    if (PRESET_USERS[roleKey]) {
      setCurrentUser(PRESET_USERS[roleKey]);
    }
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    return res.user;
  };

  const logout = () => {
    setCurrentUser(PRESET_USERS.requester);
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
      presetUsers: PRESET_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
