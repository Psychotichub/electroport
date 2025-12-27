import TopNav from './TopNav'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <TopNav />
      <main className="page-container">{children}</main>
      <Footer />
    </div>
  )
}

export default Layout

