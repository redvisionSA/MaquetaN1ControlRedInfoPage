import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
/* Orden: Tailwind (base, componentes, utilidades) + piezas de la tienda, y
   despues la hoja de la web v1, que define tokens, tipografia y la vitrina. */
import './index.css'
import './estilos/v1.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
