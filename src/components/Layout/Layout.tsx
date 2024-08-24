import React from 'react';
import SideBar from '../SideBar/SideBar';
import { Route, Routes } from 'react-router';
import NotFound from '../../pages/NotFound/NotFound';
import Dataview from '../../pages/Dataview/Dataview';
import Auth from '../../pages/Auth/Auth';
import MapContainer from '../../pages/MapContainer/MapContainer';
import Home from '../../pages/Home/Home';
import Profile from '../../pages/Profile/Profile';
import ProfileLayout from '../../pages/Profile/ProfileLayout';
import OrganizationLayout from '../../pages/Organization/OrganizationLayout';
import Organization from '../../pages/Organization/Organization';
import BillingLayout from '../../pages/Billing/BillingLayout';
import Billing from '../../pages/Billing/Billing';
import ProfileMain from '../../pages/Profile/Routes/ProfileMain/ProfileMain';
import InternalCostEstimator from '../../pages/Billing/Routes/InternalCostEstimator/InternalCostEstimator';

const Layout = () => {
    return (
        <>
            <SideBar />

            <>
                <Routes>
                    <Route path="*" element={<NotFound />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/tabularView" element={<Dataview />} />
                    <Route path={"/profile/*"} element={<Profile />} />
                    <Route path={"/organization/*"} element={<Organization />} />
                    <Route path={"/billing/*"} element={<Billing />} />
                </Routes>
            </>

            <>
                <Routes>
                    <Route path={"/"} element={<MapContainer />} />
                    <Route path={"/tabularView"} element={<></>} />
                    <Route path={"/profile"} element={<ProfileLayout />}>
                        <Route path='' element={<ProfileMain />} />
                        <Route path='change-password' element={<>Change Password</>} />
                        <Route path='change-email' element={<>Change Email</>} />
                        <Route path='payment-option' element={<>Payment Options</>} />
                    </Route>
                    <Route path={"/organization"} element={<OrganizationLayout />}>

                    </Route>
                    <Route path={"/billing"} element={<BillingLayout />}>
                        <Route path='' element={<InternalCostEstimator />}/>
                        <Route path='price' />
                    </Route>
                </Routes>
            </>
        </>
    );
}

export default Layout;
