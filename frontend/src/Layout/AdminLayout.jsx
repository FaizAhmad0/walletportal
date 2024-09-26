import React, { useState } from "react";
import { Layout, Menu, theme } from "antd";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./UserLayout.css";
import LayoutNav from "../components/LayoutNav";
import LockIcon from "@mui/icons-material/Lock";
import logoExpanded from "../assets/logo2.png";
import logoCollapsed from "../assets/Logoratan.png";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GridViewIcon from "@mui/icons-material/GridView";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const { Header, Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
  const { enrollment } = useParams();
  const [collapsed, setCollapsed] = useState(true); // Initially collapsed
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }) => {
    if (key === "/") {
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("id");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate(key, {
        state: { message: "Logged out successfully!" },
      });
    } else if (key.startsWith("https://")) {
      window.location.href = key;
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        trigger={null}
        breakpoint="md"
        collapsedWidth={80}
        width={200}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          background: "#1F222E",
          zIndex: 1000,
          borderRight: "4px solid #EF4444",
        }}
      >
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <img
            src={collapsed ? logoCollapsed : logoExpanded}
            style={{
              maxWidth: "80%",
              maxHeight: "80px",
              objectFit: "contain",
              margin: "0 auto",
              transition: "all 0.3s ease-in-out",
            }}
            alt="Logo"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          style={{
            backgroundColor: "black",
          }}
          items={[
            {
              key: "/create-manager",
              icon: <PersonAddIcon />,
              label: "Add Manager",
            },
            {
              key: "/register-user",
              icon: <PersonAddIcon />,
              label: "Add Client",
            },
            {
              key: "/view-clients",
              icon: <GridViewIcon />,
              label: "View Clients",
            },
            {
              key: "/view-managers",
              icon: <GridViewIcon />,
              label: "View Managers",
            },

            {
              key: "/view-all-orders",
              icon: <GridViewIcon />,
              label: "View Orders",
            },
            {
              key: "/wallet-action",
              icon: <AccountBalanceWalletIcon />,
              label: "Wallet Action",
            },
            {
              key: "/admin-report",
              icon: <SignalCellularAltIcon />,
              label: "Report",
            },

            {
              key: "/",
              icon: <LockIcon />,
              label: "Logout",
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        {/* Header with Navbar */}
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            position: "fixed",
            width: `calc(100% - ${collapsed ? 80 : 200}px)`,
            zIndex: 1,
          }}
        >
          <LayoutNav />
        </Header>

        {/* Main Content Area */}
        <Content
          style={{
            margin: "64px 1px 1px",
            padding: 25,
            minHeight: "calc(100vh - 104px)",
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
