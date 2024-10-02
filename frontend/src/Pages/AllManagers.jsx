import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "../Layout/AdminLayout";
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

  return (
    <AdminLayout>
      <div className="container mx-auto pr-6 pb-6 pl-6">
        <div>
          <h1 className="text-2xl font-bold text-center mb-6 text-xl">
            Here is all the Manager
          </h1>
          <input
            type="text"
            style={{ width: "30%" }}
            placeholder="Search by enrollment"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          />
          <h2 className="text-sm">Total managers : {clients.length}</h2>
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-600">No manager found.</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default AllManagers;
