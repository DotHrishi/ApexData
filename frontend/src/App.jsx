import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HomePage from './pages/HomePage'
import Analytics from './pages/Analytics'
import News from './pages/News'

const App = () => {
  return (
    <>
    <Routes>
      <Route path='/' element={<HomePage />} />
      <Route path='/analytics' element={<Analytics />} />
      <Route path='/news' element={<News />} />
    </Routes>
    </>
  )
}

export default App