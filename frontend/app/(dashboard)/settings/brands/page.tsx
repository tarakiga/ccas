'use client'

import { useState } from 'react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { usePermissions } from '@/lib/hooks/usePermissions'

// Mock brands data - will be replaced with API
const INITIAL_BRANDS = [
  { id: '1', name: 'Toyota', category: 'Automotive', active: true, createdAt: '2025-01-01' },
  { id: '2', name: 'Honda', category: 'Automotive', active: true, createdAt: '2025-01-02' },
  { id: '3', name: 'Nissan', category: 'Automotive', active: true, createdAt: '2025-01-03' },
  { id: '4', name: 'Mazda', category: 'Automotive', active: true, createdAt: '2025-01-04' },
]

export default function BrandsManagementPage() {
  const permissions = usePermissions()
  const [brands, setBrands] = useState(INITIAL_BRANDS)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<typeof INITIAL_BRANDS[0] | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<typeof INITIAL_BRANDS[0] | null>(null)
  
  const [newBrand, setNewBrand] = useState({
    name: '',
    category: 'Automotive',
  })
  
  const [editBrand, setEditBrand] = useState({
    name: '',
    category: '',
  })

  // Redirect if not admin
  if (permissions.user?.role !== 'Admin') {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only System Administrators can access this page.</p>
          <Button className="mt-4" onClick={() => (window.location.href = '/')}>Go to Dashboard</Button>
        </Card>
      </div>
    )
  }

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddBrand = () => {
    if (!newBrand.name) {
      alert('Please enter a brand name')
      return
    }
    
    const brand = {
      id: `brand-${Date.now()}`,
      name: newBrand.name,
      category: newBrand.category,
      active: true,
      createdAt: new Date().toISOString(),
    }
    
    setBrands([...brands, brand])
    setNewBrand({ name: '', category: 'Automotive' })
    setShowAddModal(false)
    alert('Brand added successfully!')
  }

  const handleEditBrand = () => {
    if (!selectedBrand || !editBrand.name) {
      alert('Please enter a brand name')
      return
    }
    
    const updated = {
      ...selectedBrand,
      name: editBrand.name,
      category: editBrand.category || selectedBrand.category,
    }
    
    setBrands(brands.map(b => b.id === selectedBrand.id ? updated : b))
    setSelectedBrand(null)
    setEditBrand({ name: '', category: '' })
    alert('Brand updated successfully!')
  }

  const handleDeleteBrand = (brand: typeof INITIAL_BRANDS[0]) => {
    setBrands(brands.filter(b => b.id !== brand.id))
    setShowDeleteConfirm(null)
    alert(`Brand "${brand.name}" deleted successfully!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brand Management</h1>
          <p className="mt-1 text-sm text-gray-600">Manage brands for shipment creation</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Brand
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Total Brands</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{brands.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Active Brands</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{brands.filter(b => b.active).length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-gray-600">Categories</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{new Set(brands.map(b => b.category)).size}</p>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6">
        <Input
          placeholder="Search brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Card>

      {/* Brands Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{brand.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={brand.active ? 'success' : 'default'}>
                      {brand.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(brand.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedBrand(brand)
                          setEditBrand({ name: brand.name, category: brand.category })
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setShowDeleteConfirm(brand)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900">Add New Brand</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Name *</label>
                <Input
                  placeholder="e.g., Toyota"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({...newBrand, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={newBrand.category}
                  onChange={(e) => setNewBrand({...newBrand, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="Automotive">Automotive</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddBrand}>Add Brand</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Brand Modal */}
      {selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Brand</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Name *</label>
                <Input
                  value={editBrand.name}
                  onChange={(e) => setEditBrand({...editBrand, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editBrand.category || selectedBrand.category}
                  onChange={(e) => setEditBrand({...editBrand, category: e.target.value})}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="Automotive">Automotive</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Machinery">Machinery</option>
                  <option value="Consumer Goods">Consumer Goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setSelectedBrand(null); setEditBrand({ name: '', category: '' }); }}>Cancel</Button>
              <Button onClick={handleEditBrand}>Save Changes</Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Brand</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <strong>{showDeleteConfirm.name}</strong>?
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
              <Button variant="outline" className="bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteBrand(showDeleteConfirm)}>
                Delete Brand
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
