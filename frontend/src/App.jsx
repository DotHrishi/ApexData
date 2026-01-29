import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalyticsPage from './pages/AnalyticsPage'

const App = () => {
  return (
    <>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/analytics' element={<AnalyticsPage />} />
    </Routes>
    </>
  )
}

export default App