import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { PortfolioTable } from './components/PortfolioTable/PortfolioTable';
import { AddAssetForm } from './components/AddAssetForm/AddAssetForm';
import './styles/variables.scss';
import './App.scss';

function App() {
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);

  return (
    <Provider store={store}>
      <div className="App" role="application">
        <div className="header" role="banner">
          <h1>Крипто Портфель</h1>
          <button 
            className="addButton"
            onClick={() => setIsAddAssetModalOpen(true)}
            aria-label="Добавить новый актив в портфель"
          >
            Добавить актив
          </button>
        </div>
        
        <AddAssetForm 
          isOpen={isAddAssetModalOpen}
          onClose={() => setIsAddAssetModalOpen(false)}
        />
        <PortfolioTable />
      </div>
    </Provider>
  );
}

export default App; 