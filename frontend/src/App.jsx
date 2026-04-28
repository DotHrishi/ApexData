import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import Analytics from './pages/Analytics'
import News from './pages/News'

import ErrorBoundary from './components/ErrorBoundary'

const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/analytics' element={<Analytics />} />
        <Route path='/news' element={<News />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App