import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import GlobalStyles from '@/Globals/GlobalStyles';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
      <UserProvider>
      <GlobalStyles>
        <App />
      </GlobalStyles>
          </UserProvider>
  </BrowserRouter>
);

reportWebVitals();
