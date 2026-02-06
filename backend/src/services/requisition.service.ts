import api from './api';

// 1. Get All Requisitions (For Dashboard)
export const getRequisitions = async () => {
  const response = await api.get('/requisitions');
  return response.data;
};

// 2. Create New Requisition (For Engineers)
export const createRequisition = async (data: any) => {
  const response = await api.post('/requisitions', data);
  return response.data;
};

// 3. Approve Requisition (For Managers)
export const approveRequisition = async (id: number, userId: string) => {
  const response = await api.put(`/requisitions/${id}/approve`, { approved_by: userId });
  return response.data;
};