import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import RaceData from './pages/RaceData.jsx'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RaceData />
    </>
  )
}

export default App
