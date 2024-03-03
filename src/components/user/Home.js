import UserPayments from './UserPayments.js';
import UserLoans from './UserLoans.js';
import SimpleBar from 'simplebar-react';
import { Helmet } from 'react-helmet';
import { Footer } from '../Footer.js';

const Home = () => {
	return(
		<>
		    <Helmet>
		      <title>Tangulbei | Home</title>
		    </Helmet>
		    <div className="main-content user-main-container">
		      <SimpleBar className="page-content page-container-scroll">
		             <div className="container-fluid">
						<div className="row">
			                <div className="">
			                    <div className="page-title-box d-flex align-items-center justify-content-between">
			                        <h4 className="mb-0">Home</h4>
			                    </div>
			                </div>
			            <div className="row">
			                <UserPayments/>		                
			                <UserLoans/>		                
			            </div>
			            </div>
			        </div>
              <Footer/>
		      </SimpleBar>
		    </div>
	    </>
		)
}

export default Home;