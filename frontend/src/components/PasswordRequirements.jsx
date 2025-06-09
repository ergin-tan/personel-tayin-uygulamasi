import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { 
      text: 'En az 8 karakter', 
      isMet: password && password.length >= 8 
    },
    { 
      text: 'En az 1 büyük harf (A-Z)', 
      isMet: password && /[A-Z]/.test(password) 
    },
    { 
      text: 'En az 1 küçük harf (a-z)', 
      isMet: password && /[a-z]/.test(password) 
    },
    { 
      text: 'En az 1 rakam (0-9)', 
      isMet: password && /[0-9]/.test(password) 
    },
    { 
      text: 'En az 1 özel karakter (!@#$%^&*()_+-=[]{}|:;<>,.?)', 
      // eslint-disable-next-line no-useless-escape
      isMet: password && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) 
    }
  ];

  return (
    <div className="password-requirements">
      <p>Şifre gereksinimleri:</p>
      <ul>
        {requirements.map((req, index) => (
          <li 
            key={index} 
            className={req.isMet ? 'password-requirement-met' : 'password-requirement-unmet'}
          >
            {req.isMet ? <FaCheck size={12} /> : <FaTimes size={12} />} {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements; 