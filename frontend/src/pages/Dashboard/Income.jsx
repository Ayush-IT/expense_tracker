import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import IncomeOverview from '../../components/Income/IncomeOverview';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddIncomeForm';
import toast from 'react-hot-toast';
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/DeleteAlert';
import { useUserAuth } from '../../hooks/useUserAuth';

const Income = () => {

  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null
  }); 


  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [openEditIncomeModal, setOpenEditIncomeModal] = useState({
    show: false,
    data: null,
  });

  //Get All Income Details
  const fetchIncomeDetails = async () => {
    if(loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
      if(response.data) {
        // setIncomeData(response.data);
        setIncomeData(response.data.data || []);
      }   
      } catch (error) {
        console.error("Failed to fetch income details:", error);  
      } finally {
        setLoading(false);
      }
  };

 // Handle Update Income
 const handleUpdateIncome = async (updated) => {
  if (!openEditIncomeModal.data) return;
  const { source, amount, date, icon } = updated;

  // Optional minimal validation
  if (!source?.trim()) return toast.error('Source is required');
  if (!amount || isNaN(amount) || Number(amount) <= 0) return toast.error('Amount should be a valid number greater than 0');
  if (!date) return toast.error('Date is required');

  try {
    await axiosInstance.put(API_PATHS.INCOME.UPDATE_INCOME(openEditIncomeModal.data._id), { source, amount, date, icon });
    toast.success('Income updated successfully');
    setOpenEditIncomeModal({ show: false, data: null });
    fetchIncomeDetails();
  } catch (error) {
    console.error('Failed to update income:', error);
    toast.error('Failed to update income');
  }
 };

 //Handle Add Income
 const handleAddIncome = async (income) => {
  const {source, amount, date, icon} = income;

  //Validation check
  if(!source?.trim()){
    toast.error("Source is required");
    return;
  }

  if(!amount || isNaN(amount) || Number(amount) <= 0){
    toast.error("Amount should be a valid number greater than 0");
    return;
  }

  if(!date){
    toast.error("Date is required");
    return;
  }

  try{
    await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {source, amount, date, icon});
    fetchIncomeDetails();
    setOpenAddIncomeModal(false);
    toast.success("Income added successfully");
  } catch (error) {
    console.error("Failed to add income:", error);
    toast.error("Failed to add income");
  }
 };

 //Delete Income
 const deleteIncome = async (id) => {
  try {
    await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
    setOpenDeleteAlert({show: false, data: null});
    toast.success("Income deleted successfully");
    fetchIncomeDetails();
  } catch (error) {
    console.error("Failed to delete income:", error);
    toast.error("Failed to delete income");
  }
 };

 //handle download Income details
 const handleDownloadIncomeDetails = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
      responseType: 'blob',
    });

    //Create a Url for the blob
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'income_details.xlsx');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download income details:", error);
    toast.error("Failed to download income details. Please try again.");
  }
 };


 useEffect(() => {
  fetchIncomeDetails();
  return () => {};
 }, []);

  return (
    <DashboardLayout activeMenu='Income'>
     <div className='my-5 mx-auto'>
      <div className='grid grid-cols-1 gap-6'>
        <div className=''>
          <IncomeOverview
           transactions={incomeData}
           onAddIncome={() => setOpenAddIncomeModal(true)}
          />
        </div>

        <IncomeList
         transactions={incomeData}
         onDelete={(id) => {
           setOpenDeleteAlert({show: true, data: id});
         }}
         onDownload={handleDownloadIncomeDetails}
         onAdd={() => setOpenAddIncomeModal(true)}
         onEdit={(income) => {
           // Pre-format date for input type=date
           const formatted = {
             ...income,
             date: income?.date ? new Date(income.date).toISOString().slice(0, 10) : '',
           };
           setOpenEditIncomeModal({ show: true, data: formatted });
         }}
        />
      </div>   

      <Modal
        isOpen={openAddIncomeModal}
        onClose={() => setOpenAddIncomeModal(false)}
        title="Add Income"
      >
        <AddIncomeForm onAddIncome={handleAddIncome} />
      </Modal>

      <Modal
        isOpen={openEditIncomeModal.show}
        onClose={() => setOpenEditIncomeModal({ show: false, data: null })}
        title="Edit Income"
      >
        <AddIncomeForm
          initialValues={openEditIncomeModal.data}
          onSubmit={handleUpdateIncome}
          submitLabel="Save Changes"
        />
      </Modal>

      <Modal
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({show: false, data: null})}
        title="Delete Income"
      >
        <DeleteAlert
         content="Are you sure you want to delete this income details?"
         onDelete={() => deleteIncome(openDeleteAlert.data)}
        />
      </Modal>
     </div>
    </DashboardLayout>
  )
}

export default Income
