import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Table, Input, Typography } from "antd";

const { Search } = Input;
const { Title } = Typography;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AllManagers = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input

  const getClients = async () => {
    try {
      const response = await axios.get(`${backendUrl}/user/getallmanagers`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      setClients(response.data.clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  // Filter clients by enrollment based on search term
  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: "Manager Name",
      dataIndex: "name",
      key: "name",
      className: "text-xs",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "text-xs",
    },
    {
      title: "Enrollment",
      dataIndex: "enrollment",
      key: "enrollment",
      className: "text-xs",
    },
    {
      title: "Phone",
      dataIndex: "mobile",
      key: "mobile",
      className: "text-xs",
    },
    {
      title: "Balance",
      dataIndex: "amount",
      key: "amount",
      className: "text-xs",
    },
    {
      title: "GMS",
      dataIndex: "gms",
      key: "gms",
      className: "text-xs",
    },
  ];

  return (
    <AdminLayout>
      <div className="container mx-auto p-6">
        <Title level={2} className="text-center mb-6">
          Here are all the Managers
        </Title>

        <Search
          placeholder="Search by enrollment"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "40%", marginBottom: "16px" }}
        />

        <Title level={5}>Total Managers: {clients.length}</Title>

        <Table
          columns={columns}
          dataSource={filteredClients}
          rowKey={(record) => record._id}
          pagination={{ pageSize: 5 }}
          bordered
          className="managers-table"
        />

        {filteredClients.length === 0 && (
          <p className="text-center text-gray-600">No managers found.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllManagers;
