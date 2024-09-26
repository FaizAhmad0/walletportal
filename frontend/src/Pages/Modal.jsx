import React, { useState } from 'react';

const Modal = ({ isVisible, onClose, onSubmit }) => {
  const [customPartner, setCustomPartner] = useState('');

  const handleSubmit = () => {
    if (customPartner.trim()) {
      onSubmit(customPartner);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Enter Your Delivery Partner</h2>
        <input
          type="text"
          value={customPartner}
          onChange={(e) => setCustomPartner(e.target.value)}
          placeholder="Enter your delivery partner"
          className="w-full p-2 border rounded-md focus:border-blue-500 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <div className="flex justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded mr-2 hover:bg-gray-600 focus:outline-none focus:ring focus:ring-gray-200 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200 transition duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
