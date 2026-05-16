import { useState } from 'react'
import Link from 'next/link'
import { FaUsers, FaDollarSign, FaCheckCircle, FaStar } from 'react-icons/fa'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('vendors')

  const stats = [
    { label: 'Total Vendors', value: '45', icon: <FaUsers />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Platform Revenue', value: '$12,450', icon: <FaDollarSign />, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Verification', value: '8', icon: <FaCheckCircle />, color: 'bg-yellow-50 text-yellow-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-primary">LTTMS</Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">System Admin</h1>
          </div>
          <button className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition">Logout</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl text-2xl transition-transform group-hover:scale-110 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b bg-gray-50/50">
            <div className="flex space-x-10 px-10">
              {['vendors', 'reports', 'settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-6 border-b-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${
                    activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-10">
            {activeTab === 'vendors' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Vendor Verification</h2>
                    <p className="text-gray-500 font-medium">Review and approve local service providers</p>
                  </div>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-xs font-bold text-gray-900">All</button>
                    <button className="px-4 py-2 text-xs font-bold text-gray-500">Pending</button>
                    <button className="px-4 py-2 text-xs font-bold text-gray-500">Approved</button>
                  </div>
                </div>

                <div className="overflow-hidden border border-gray-100 rounded-2xl">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Vendor Name</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Contact Email</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Eco-Rating</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500">Status</th>
                        <th className="px-6 py-5 text-xs font-black uppercase tracking-widest text-gray-500 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[1, 2, 3, 4].map(i => (
                        <tr key={i} className="hover:bg-gray-50/50 transition group">
                          <td className="px-6 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-primary font-black text-xs">V{i}</div>
                              <span className="font-bold text-gray-900">EcoTours Bahir Dar {i}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-gray-600 text-sm font-medium">vendor{i}@laketana.com</td>
                          <td className="px-6 py-5">
                            <div className="flex text-yellow-400 text-xs">
                              <FaStar /><FaStar /><FaStar /><FaStar /><FaStar className="text-gray-200" />
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-100">
                              Pending Review
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right space-x-4">
                            <button className="text-green-600 font-bold text-xs uppercase tracking-widest hover:underline">Approve</button>
                            <button className="text-red-600 font-bold text-xs uppercase tracking-widest hover:underline">Reject</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl font-black text-gray-900 mb-8">Platform Analytics</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-[0.2em]">Booking Trends</h3>
                    <div className="h-48 flex items-end justify-between px-4">
                      {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                        <div key={i} className="w-4 bg-primary rounded-t-full" style={{ height: `${h}%` }}></div>
                      ))}
                    </div>
                  </div>
                  <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 uppercase text-xs tracking-[0.2em]">Revenue Share</h3>
                    <div className="flex items-center justify-center h-48">
                      <div className="w-32 h-32 rounded-full border-[12px] border-primary border-r-transparent animate-spin-slow"></div>
                      <div className="absolute font-black text-xl text-primary">82%</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
