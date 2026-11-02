import React from 'react';

const Navigation = () => {
  return (
    <nav data-testid="navigation">
      <Link to="/" data-testid="dashboard-link">Dashboard</Link>
      <Link to="/login" data-testid="login-link">Login</Link>
    </nav>
  );
};

export default Navigation;
