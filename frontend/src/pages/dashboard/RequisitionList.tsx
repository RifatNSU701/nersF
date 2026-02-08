import React, { useEffect, useState } from 'react';
import { getRequisitions, approveRequisition } from '../../services/requisition.service';

const RequisitionList = () => {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Fetch Data on Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getRequisitions();
      setRequisitions(data);
    } catch (err) {
      setError('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Approval Click
  const handleApprove = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve this requisition? Stock will be deducted immediately.')) return;

    try {
      // Hardcoded Admin ID for now (we will fix this when we add Login)
      const adminId = "4dbdfef8-75dc-4725-b9e2-8a3bbec89ece"; 
      await approveRequisition(id, adminId);
      alert('Approved Successfully!');
      loadData(); // Refresh the list
    } catch (err: any) {
      alert('Error: ' + (err.response?.data?.message || 'Approval Failed'));
    }
  };

  if (loading) return <div>Loading Requisitions...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Requisition Management</h2>
      <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
            <th>ID</th>
            <th>Project</th>
            <th>Warehouse</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requisitions.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.project_name}</td>
              <td>{req.warehouse_name}</td>
              <td>
                <span style={{ 
                  color: req.status === 'APPROVED' ? 'green' : 'orange',
                  fontWeight: 'bold' 
                }}>
                  {req.status}
                </span>
              </td>
              <td>
                {req.status === 'PENDING' && (
                  <button 
                    onClick={() => handleApprove(req.id)}
                    style={{ background: 'green', color: 'white', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequisitionList;