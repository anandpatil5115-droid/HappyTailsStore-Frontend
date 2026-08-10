import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fieldLabelStyle, fieldInputStyle, iconLeftStyle, showToggleStyle, fieldErrorStyle,
} from '../styles/authStyles';
import { EyeIcon, EyeSlashIcon } from '../styles/AuthIcons';

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
            boxShadow: error
              ? 'none'
              : focused
                ? '0 4px 14px rgba(255, 145, 77, 0.18)'
                : 'none',
            background: focused ? 'rgba(255,145,77,0.03)' : 'transparent',
          }}
        />
        {isPassword && (
          <motion.button
            type="button"
            onClick={onTogglePassword}
            style={showToggleStyle}
            whileTap={{ scale: 0.88 }}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            animate={focused ? { color: '#9b4500' } : { color: '#dcc1b4' }}
            transition={{ duration: 0.2 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={showPassword ? 'show' : 'hide'}
                initial={{ opacity: 0, rotate: -20, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 20, scale: 0.6 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'inline-flex', alignItems: 'center' }}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        )}
      </div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={fieldErrorStyle}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
}