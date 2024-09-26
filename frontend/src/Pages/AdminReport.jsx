import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
import { Modal, Button, Table } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const AdminReport = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManagerClients, setSelectedManagerClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const filteredClients = clients.filter((client) =>
    client.enrollment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewClientsClick = async (managerName) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/user/getmanagerclients`,
        { managerName },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setSelectedManagerClients(response.data.clients);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Error fetching manager clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedManagerClients([]);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto ">
        <div>
          <h1 className="text-2xl font-bold text-center mb-6">
            Here is all the Managers
          </h1>
          <input
            type="text"
            style={{ width: "30%" }}
            placeholder="Search by enrollment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          />
        </div>

        {filteredClients?.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg text-xs">
            <thead className="bg-gray-200">
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300">
                  Manager Name
                </th>
                <th className="px-4 py-2 border border-gray-300">Email</th>
                <th className="px-4 py-2 border border-gray-300">Enrollment</th>
                <th className="px-4 py-2 border border-gray-300">Phone</th>
                <th className="px-4 py-2 border border-gray-300">Balance</th>
                <th className="px-4 py-2 border border-gray-300">GMS</th>
                <th className="px-4 py-2 border border-gray-300">
                  Action
                </th>{" "}
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr
                  key={index}
                  className="text-center hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {client.name}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.email}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.enrollment}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.mobile}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.amount}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {client.gms}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <Button
                      type="primary"
                      className="text-xs italic"
                      onClick={() => handleViewClientsClick(client.name)}
                      loading={loading}
                    >
                      View Clients
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No manager found.</p>
        )}
      </div>

      <Modal
        title="Manager's Clients"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        {selectedManagerClients?.length > 0 ? (
          <Table
            dataSource={selectedManagerClients}
            columns={[
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
              },
              {
                title: "Enrollment",
                dataIndex: "enrollment",
                key: "enrollment",
              },
              {
                title: "Email",
                dataIndex: "email",
                key: "email",
              },
              {
                title: "GMS",
                dataIndex: "gms",
                key: "gms",
              },
            ]}
            pagination={false}
            rowKey={(record) => record.enrollment}
          />
        ) : (
          <p>No clients found for this manager.</p>
        )}
      </Modal>
    </AdminLayout>
  );
};

export default AdminReport;
