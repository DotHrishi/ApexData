import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import Analytics from './pages/Analytics'
import News from './pages/News'
import Technical from './pages/Technical'
import AIStrategy from './pages/AIStrategy'

import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/racesim-ai' element={<AIStrategy />} />
        <Route path='/strategy-ai' element={<AIStrategy />} />
        <Route path='/news' element={<News />} />
        <Route path='/technical' element={<Technical />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App