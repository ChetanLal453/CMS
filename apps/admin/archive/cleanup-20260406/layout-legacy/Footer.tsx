import { currentYear, developedBy } from '@/context/constants'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 text-center">
            {currentYear} © Techmin - Theme by <b>{developedBy}</b>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
