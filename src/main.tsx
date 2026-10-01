import { useState } from 'react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './ui/App';
import Splash from './ui/Splash';
import './ui/styles.css';

function Root() {
  const [entered, setEntered] = useState(false);
  return entered ? <App /> : <Splash onEnter={() => setEntered(true)} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
