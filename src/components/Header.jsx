import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.scss';

const Header = () => (
  <header className="app-header">
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <span className="navbar-brand app-logo">✦ Story Management</span>
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 app-nav">
          <li className="nav-item">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/stories" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Stories
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/tags" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Tags
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  </header>
);

export default Header; 