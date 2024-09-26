import React, { useEffect, useState } from "react";
import ManagerLayout from "../Layout/ManagerLayout";
import axios from "axios";
import { Modal, Button, Input, message } from "antd";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const ManagerClients = () => {
  const [clients, setClients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [gmsModalVisible, setGmsModalVisible] = useState(false);
  const [gmsValue, setGmsValue] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // New state for search

  const getClients = async () => {
    const name = localStorage.getItem("name");
    try {
      const response = await axios.get(
        `${backendUrl}/user/getmanagerclient/${name}`,
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      setClients(response.data.clients);
      console.log("Clients fetched:", response.data.clients); // Log fetched clients
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleAddGms = (client) => {
    setSelectedClient(client);
    setGmsModalVisible(true);
  };

  const handleSubmitGms = async () => {
    if (!gmsValue) {
      message.error("Please enter a valid GMS value");
      return;
    }
    try {
      await axios.put(
        `${backendUrl}/user/updategms/${selectedClient._id}`,
        { gms: gmsValue },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      message.success("GMS updated successfully");
      setGmsModalVisible(false);
      setGmsValue("");
      getClients(); // Refresh the client list to reflect the updated GMS
    } catch (error) {
      message.error("Failed to update GMS");
      console.error("Error updating GMS:", error);
    }
  };

  useEffect(() => {
    getClients();
  }, []);

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedClient(null);
    setClientOrders([]);
  };

  const handleCloseGmsModal = () => {
    setGmsModalVisible(false);
    setGmsValue("");
  };

  // Filter clients based on the search query
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.enrollment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.mobile.toString().includes(searchQuery) // Ensure mobile is treated as a string
  );

  // Debugging: log search query and filtered clients
  console.log("Search Query:", searchQuery);
  console.log("Filtered Clients:", filteredClients);

  return (
    <ManagerLayout>
      <div className="container mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-center mb-6">
            {localStorage.getItem("name")}'s Clients
          </h1>

          {/* Search input */}
          <Input
            type="text"
            placeholder="Search clients"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "20px", width: "300px" }}
          />
        </div>

        {filteredClients.length > 0 ? (
          <table className="table-auto w-full border-collapse border border-gray-200 shadow-lg text-xs">
            <thead className="bg-gray-200">
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border border-gray-300">
                  Client Name
                </th>
                <th className="px-4 py-2 border border-gray-300">Email</th>
                <th className="px-4 py-2 border border-gray-300">Enrollment</th>
                <th className="px-4 py-2 border border-gray-300">Phone</th>
                <th className="px-4 py-2 border border-gray-300">Balance</th>
                <th className="px-4 py-2 border border-gray-300">GMS</th>
                <th className="px-4 py-2 border border-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr key={index} className="text-center hover:bg-gray-50">
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
                    <Button className="text-xs" type="primary" onClick={() => handleAddGms(client)}>
                      Update GMS
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No clients found.</p>
        )}

        {/* Add GMS Modal */}
        <Modal
          title={`Add GMS for ${selectedClient?.name}`}
          visible={gmsModalVisible}
          onCancel={handleCloseGmsModal}
          footer={[
            <Button key="close" onClick={handleCloseGmsModal}>
              Cancel
            </Button>,
            <Button key="submit" type="primary" onClick={handleSubmitGms}>
              Submit
            </Button>,
          ]}
        >
          <Input
            placeholder="Enter GMS value"
            value={gmsValue}
            onChange={(e) => setGmsValue(e.target.value)}
          />
        </Modal>
      </div>
    </ManagerLayout>
  );
};

export default ManagerClients;
