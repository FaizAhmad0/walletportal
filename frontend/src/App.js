import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import LoginForm from "./Pages/LoginForm";
import RegisterUser from "./Pages/RegisterUser";
import UserDash from "./Pages/UserDash";
import Wallet from "./Pages/Wallet";
import Tier from "./Pages/Tier";
import BodFba from "./Pages/BodFba";
import DispatchDash from "./Pages/DispatchDash";
import CreateOrder from "./Pages/CreateOrder";
import AddItems from "./Pages/AddItems";
import UploadProducts from "./Pages/UploadProducts";
import PaymentSuccess from "./Pages/PaymentSuccess";
import PaymentStatus from "./Pages/PaymentStatus";
import DetailsReporting from "./Pages/DetailsReporting";
import ManagerDash from "./Pages/ManagerDash";
import OrderReport from "./Pages/OrderReport";
import ManagerClients from "./Pages/ManagerClients";
import OrderHistory from "./Pages/OrderHistory";
import ManagerReport from "./Pages/ManagerReport";
import AdminDash from "./Pages/AdminDash";
import AllClients from "./Pages/AllClients";
import AllManagers from "./Pages/AllManagers";
import AllOrders from "./Pages/AllOrders";
import WalletAction from "./Pages/WalletAction";
import InvoicePage from "./Pages/InvoicePage";
import RegisterManager from "./Pages/RegisterManager";
import AdminReport from "./Pages/AdminReport";
import BulkOrder from "./Pages/BulkOrder";
import ArchivedOrders from "./Pages/ArchivedOrders";
import ShippingOrder from "./Pages/ShippingOrder";
import BulkOrders from "./Pages/BulkOrders";
import ShippingDash from "./Pages/ShippingDash";
import ShippedOrders from "./Pages/ShippedOrders";
import AuditReport from "./Pages/AuditReport";
import AddManagerClient from "./Pages/AddManagerClient";
import AccountantDash from "./Pages/AccountantDash";
import AdminDetailsReporting from "./Pages/AdminDetailsReporting";
import AdminOrdersReport from "./Pages/AdminOrdersReport";
import TotalSale from "./Pages/TotalSale";
import SpecificDayOrder from "./Pages/SpecificDayOrder";
import DispatchOrdersReport from "./Pages/DispatchOrdersReport";
import DispatchWalletAction from "./Pages/DispatchWalletAction";
import DispatchAllTransaction from "./Pages/DispatchAllTransaction";
import AllTransaction from "./Pages/AllTransaction";
import BulkOrderDetails from "./Pages/BulkOrderDetails";
import DispatchBulk from "./Pages/DispatchBulk";
import Verify from "./Pages/Verify";
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" exact element={<LoginForm />} />
          <Route path="/register-user" exact element={<RegisterUser />} />
          <Route path="/verify" exact element={<Verify />} />
          <Route path="/user-order" exact element={<UserDash />} />
          <Route path="/wallet" exact element={<Wallet />} />
          <Route path="/tiar" exact element={<Tier />} />
          <Route path="/bod" exact element={<BodFba />} />
          <Route path="/dispatch-dash" exact element={<DispatchDash />} />
          <Route path="/create-order" exact element={<CreateOrder />} />
          <Route path="/add-items/:enrollment" exact element={<AddItems />} />
          <Route path="/products" exact element={<UploadProducts />} />
          <Route path="/success" exact element={<PaymentSuccess />} />
          <Route path="/payment-status" exact element={<PaymentStatus />} />
          <Route path="/clients" exact element={<ManagerClients />} />
          <Route path="/dispatch-bulkorder" exact element={<DispatchBulk />} />
          <Route path="/archive-orders" exact element={<ArchivedOrders />} />
          <Route path="/shipped-orders" exact element={<ShippingOrder />} />
          <Route path="/bulkOrders" exact element={<BulkOrders />} />
          <Route path="/bulkorder/:orderId" element={<BulkOrderDetails />} />
          <Route
            path="/details-reporting"
            exact
            element={<DetailsReporting />}
          />
          <Route path="/manager-dash" exact element={<ManagerDash />} />
          <Route path="/order-history" exact element={<OrderHistory />} />
          <Route path="/bulkorder" exact element={<BulkOrder />} />
          <Route path="/manager-reports" exact element={<ManagerReport />} />
          <Route path="/admin-dash" exact element={<AdminDash />} />
          <Route path="/view-clients" exact element={<AllClients />} />
          <Route path="/view-managers" exact element={<AllManagers />} />
          <Route path="/view-all-orders" exact element={<AllOrders />} />
          <Route path="/wallet-action" exact element={<WalletAction />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/add-user" element={<AddManagerClient />} />
          <Route path="/create-manager" element={<RegisterManager />} />
          <Route path="/admin-report" element={<AdminReport />} />
          <Route path="/admin-order-reports" element={<AdminOrdersReport />} />
          <Route path="/total-sale" element={<TotalSale />} />
          <Route path="/orders/:date" element={<SpecificDayOrder />} />
          <Route path="/shippingmanager-dash" element={<ShippingDash />} />
          <Route path="/shipped" element={<ShippedOrders />} />
          <Route path="/audit-report" element={<AuditReport />} />
          <Route path="/accountant-dash" element={<AccountantDash />} />
          <Route path="/all-transaction" element={<DispatchAllTransaction />} />
          <Route path="/all-transactions" element={<AllTransaction />} />
          <Route
            path="/dispatch-order-report"
            element={<DispatchOrdersReport />}
          />
          <Route
            path="/dispatch-wallet-action"
            element={<DispatchWalletAction />}
          />
          <Route
            path="/admin-details-reporting"
            element={<AdminDetailsReporting />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;
