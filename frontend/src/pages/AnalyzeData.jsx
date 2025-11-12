import OptionsSelector from '../components/OptionsSelector'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

const AnalyzeData = () => {
  return (
    <div>
      <Navbar />
      <h1 className='text-4xl fontStyle p-4 m-4 font-bold'><span className='text-blue-600'>DRIVER <span className='text-red-600'>vs</span> DRIVER</span> ANALYSIS</h1>
      <div>
        <OptionsSelector />
      </div>
      <Footer />
    </div>
  )
}

export default AnalyzeData