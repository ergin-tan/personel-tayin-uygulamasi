import React from 'react';
import { getPasswordStrength, getPasswordStrengthClass } from '../utils/passwordUtils';

const PasswordStrengthMeter = ({ password }) => {
  const { level, text } = getPasswordStrength(password);
  const strengthClass = getPasswordStrengthClass(level);

  return (
    <div className="password-strength-container">
      <div className="password-strength-meter">
        <div className={`password-strength-meter-bar ${strengthClass}`} style={{ width: `${level * 20}%` }}></div>
      </div>
      <div className="password-strength-text">{text}</div>
    </div>
  );
};

export default PasswordStrengthMeter; 