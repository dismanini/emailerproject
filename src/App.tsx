
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import EmailerLayout from "./EmailerLayout";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Templates from "./pages/Templates";
import Campaigns from "./pages/Campaigns";
import Settings from "./pages/Settings";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<EmailerLayout />}>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/campaigns" element={<Campaigns />} />
         <Route path="/settings" element={<Settings />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}
