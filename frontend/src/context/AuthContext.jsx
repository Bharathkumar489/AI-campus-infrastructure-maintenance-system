import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

// 1. Authorized Student Accounts (User ID = Name, Password = Reg. No)
export const STUDENT_DATABASE = [
  {
    user_id: 'Bharath',
    login_id: 'Bharath',
    registration_no: '24bcb7220',
    name: 'Bharath',
    email: 'bharath@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72220'
  },
  {
    user_id: 'Abhiram',
    login_id: 'Abhiram',
    registration_no: '24bcb7251',
    name: 'Abhiram',
    email: 'abhiram@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72251'
  },
  {
    user_id: 'Aaron',
    login_id: 'Aaron',
    registration_no: '24bcb7053',
    name: 'Aaron',
    email: 'aaron@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72053'
  },
  {
    user_id: 'Balaji',
    login_id: 'Balaji',
    registration_no: '24bcb7266',
    name: 'Balaji',
    email: 'balaji@campus.edu',
    role: 'requester',
    userType: 'student',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 72266'
  },
  {
    user_id: 'Koushik',
    login_id: 'Koushik',
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

// 2. Authorized Faculty Accounts (User ID = Name, Password = Reg. No)
export const FACULTY_DATABASE = [
  {
    user_id: 'Ananya',
    login_id: 'Ananya',
    registration_no: 'FAC10482',
    name: 'Ananya',
    email: 'ananya@campus.edu',
    role: 'requester',
    userType: 'faculty',
    department: 'Computer Science & Engineering',
    phone: '+91 98765 10482'
  },
  {
    user_id: 'Arvind',
    login_id: 'Arvind',
    registration_no: 'FAC10835',
    name: 'Arvind',
    email: 'arvind@campus.edu',
    role: 'requester',
    userType: 'faculty',
    department: 'Electronics & Communication Engineering',
    phone: '+91 98765 10835'
  },
  {
    user_id: 'Meera',
    login_id: 'Meera',
    registration_no: 'FAC10964',
    name: 'Meera',
    email: 'meera@campus.edu',
    role: 'requester',
    userType: 'faculty',
    department: 'Mechanical Engineering & Design',
    phone: '+91 98765 10964'
  }
];

// 3. Authorized Technician Accounts (User ID = Name, Password = Reg. No)
export const TECHNICIAN_DATABASE = [
  {
    user_id: 'Rajesh',
    technician_id: 'T01',
    login_id: 'Rajesh',
    registration_no: 'TECH2041',
    name: 'Rajesh',
    email: 'rajesh@campus.edu',
    role: 'technician',
    userType: 'technician',
    department: 'HVAC Services',
    skill: 'HVAC Maintenance',
    phone: '+91 98765 22041'
  },
  {
    user_id: 'Vikram',
    technician_id: 'T02',
    login_id: 'Vikram',
    registration_no: 'TECH2052',
    name: 'Vikram',
    email: 'vikram@campus.edu',
    role: 'technician',
    userType: 'technician',
    department: 'Electrical Engineering Division',
    skill: 'Electrical Maintenance',
    phone: '+91 98765 22052'
  },
  {
    user_id: 'Suresh',
    technician_id: 'T03',
    login_id: 'Suresh',
    registration_no: 'TECH2063',
    name: 'Suresh',
    email: 'suresh@campus.edu',
    role: 'technician',
    userType: 'technician',
    department: 'Plumbing & Water Works',
    skill: 'Plumbing & Water Systems',
    phone: '+91 98765 22063'
  }
];

// Combine the 11 strictly authorized users
export const ALL_AUTHORIZED_USERS = [
  ...STUDENT_DATABASE,
  ...FACULTY_DATABASE,
  ...TECHNICIAN_DATABASE
];

const PRESET_USERS = {
  // Students
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

  // Admin
  koushik: STUDENT_DATABASE[4],
  '24bcb7230': STUDENT_DATABASE[4],
  admin: STUDENT_DATABASE[4],

  // Faculty
  faculty: FACULTY_DATABASE[0],
  staff: FACULTY_DATABASE[0],
  ananya: FACULTY_DATABASE[0],
  fac10482: FACULTY_DATABASE[0],
  arvind: FACULTY_DATABASE[1],
  fac10835: FACULTY_DATABASE[1],
  meera: FACULTY_DATABASE[2],
  fac10964: FACULTY_DATABASE[2],

  // Technicians
  technician: TECHNICIAN_DATABASE[0],
  rajesh: TECHNICIAN_DATABASE[0],
  tech2041: TECHNICIAN_DATABASE[0],
  vikram: TECHNICIAN_DATABASE[1],
  tech2052: TECHNICIAN_DATABASE[1],
  suresh: TECHNICIAN_DATABASE[2],
  tech2063: TECHNICIAN_DATABASE[2]
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('agy_campus_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
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
      // quiet fallback
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
      if (apiErr.message && (apiErr.message.includes('Invalid password') || apiErr.message.includes('Access denied'))) {
        throw apiErr;
      }
      console.warn('Backend login unavailable, evaluating authorized database locally:', apiErr.message);
    }

    // 2. Strict Match ONLY against Authorized Database (11 users)
    const idLower = cleanId.toLowerCase();
    const matchedUser = ALL_AUTHORIZED_USERS.find(
      u => u.user_id.toLowerCase() === idLower ||
           u.name.toLowerCase() === idLower ||
           u.registration_no.toLowerCase() === idLower ||
           u.email.toLowerCase() === idLower
    );

    if (matchedUser) {
      const isPassValid = cleanPass.toLowerCase() === matchedUser.registration_no.toLowerCase();

      if (!isPassValid) {
        throw new Error(`Invalid password for ${matchedUser.name}. Password is your institutional Registration Number (${matchedUser.registration_no}).`);
      }

      let userObj = { ...matchedUser };
      if (matchedUser.name === 'Koushik' || matchedUser.registration_no === '24bcb7230') {
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

    // Deny all other users
    throw new Error('Access denied: User not found. Only authorized students (Bharath, Abhiram, Aaron, Balaji, Koushik), faculty (Ananya, Arvind, Meera), and technicians (Rajesh, Vikram, Suresh) can log in.');
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
      studentDatabase: STUDENT_DATABASE,
      facultyDatabase: FACULTY_DATABASE,
      technicianDatabase: TECHNICIAN_DATABASE,
      allAuthorizedUsers: ALL_AUTHORIZED_USERS
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
