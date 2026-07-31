import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthLayout from './components/AuthLayout';
export default function AuthPage() {
  return <AuthLayout><Outlet /></AuthLayout>;
}
