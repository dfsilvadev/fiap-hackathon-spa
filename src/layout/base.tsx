import Sidebar from '../components/menu/sidebar'
import { Outlet } from 'react-router'

const Base = () => {
  return (
    <div>
      <div>
        <Sidebar />
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default Base
