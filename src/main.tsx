import React from 'react';
import ReactDOM from 'react-dom/client';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './context/AppContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <BrowserRouter basename="/resourcingdemonstrator">
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </FluentProvider>
  </React.StrictMode>
);
