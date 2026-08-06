import React from 'react';
import { 
  fieldLabelStyle, fieldInputStyle, iconLeftStyle, showToggleStyle, fieldErrorStyle,
} from '../styles/authStyles';

export default function FormField({
  name, type, label, placeholder, icon,
  value, error, focused,
  onChange, onFocus, onBlur,
  isPassword, showPassword, onTogglePassword,
}) {
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: 26 }}>
      <label htmlFor={name} style={fieldLabelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <span style={iconLeftStyle}>{icon}</span>
        <input
          id={name}
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`auth-input${error ? ' input-error' : ''}`}
          style={{
            ...fieldInputStyle,
            borderColor: error ? '#dc2626' : focused ? '#ff914d' : '#dcc1b4',
          }}
        />
        {isPassword && (
          <button type="button" onClick={onTogglePassword} style={showToggleStyle}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && <div style={fieldErrorStyle}>{error}</div>}
    </div>
  );
}