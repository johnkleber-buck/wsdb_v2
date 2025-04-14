"use client"

import { useState } from 'react'

export function BasicDashboard() {
  const [activeTab, setActiveTab] = useState('Users')
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Workstation Dashboard</h1>
      
      {/* Basic tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-4">
          {['Users', 'Workstations', 'Reports'].map((tab) => (
            <button
              key={tab}
              className={`pb-2 px-1 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content based on active tab */}
      <div>
        {activeTab === 'Users' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Users</h2>
            <p>User content goes here</p>
          </div>
        )}
        
        {activeTab === 'Workstations' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Workstations</h2>
            <p>Workstation content goes here</p>
          </div>
        )}
        
        {activeTab === 'Reports' && (
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Reports</h2>
            <p>Reports content goes here</p>
          </div>
        )}
      </div>
    </div>
  )
}