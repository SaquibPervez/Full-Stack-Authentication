import { X } from 'lucide-react'
import React from 'react'
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../apis/axios'
import toast from 'react-hot-toast'

function AddEmployeeModal({ onClose }) {

  const createEmployee = async (employeeData) => {
    const { data } = await api.post('/admin/create-user', employeeData)
    return data
  }
const queryClient = useQueryClient()
const mutation = useMutation({
  mutationFn: createEmployee,
  onSuccess: (data) => {
    if (data.message === "Email already in use") {
      toast.error(data.message)
      return
    }

    toast.success(data.message || "Employee added successfully")

    queryClient.invalidateQueries(['adminStats'])

    onClose()
  },
  onError: (error) => {
    toast.error(
      error?.response?.data?.message ??
      "Something went wrong"
    )
  }
})

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const employeeData = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: formData.get('role'),
      designation: formData.get('designation'),
    }

    mutation.mutate(employeeData)
  }

  return (
    <section>
      <div className="fixed inset-0 bg-white/10 backdrop-blur-2xl flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

          <div className='flex justify-between items-center mb-4'>
            <h2 className="text-2xl font-bold">Add New Employee</h2>
            <button type="button" onClick={onClose}><X /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input type="text" name="username" required placeholder="Username" className="w-full border rounded-md p-2" />
            <input type="email" name="email" required placeholder="Email" className="w-full border rounded-md p-2" />
            <input type="password" name="password" required placeholder="Password" className="w-full border rounded-md p-2" />
            <select name="role" className="w-full border rounded-md p-2">
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
            </select>
            <input type="text" name="designation" required placeholder="Designation" className="w-full border rounded-md p-2" />

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer"
            >
              {mutation.isPending ? "Adding..." : "Add Employee"}
            </button>

          </form>

        </div>
      </div>
    </section>
  )
}

export default AddEmployeeModal
