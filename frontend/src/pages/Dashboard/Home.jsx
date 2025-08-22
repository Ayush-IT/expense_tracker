import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useUserAuth } from '../../hooks/useUserAuth';
import { useNavigate } from 'react-router-dom';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import InfoCard from '../../components/Cards/InfoCard';

import { IoMdCard } from 'react-icons/io';
import { LuHandCoins, LuWalletMinimal } from 'react-icons/lu';
import { addThousandsSeparator } from '../../utils/helper';
import RecentTransactions from '../../components/Dashboard/RecentTransactions';
import FinanceOverview from '../../components/Dashboard/FinanceOverview';
import ExpenseTransactions from '../../components/Dashboard/ExpenseTransactions';
import Last30DaysExpenses from '../../components/Dashboard/Last30DaysExpenses';
import RecentIncomeWithChart from '../../components/Dashboard/RecentIncomeWithChart';
import RecentIncome from '../../components/Dashboard/RecentIncome';
import AddTransactionModal from '../../components/AddTransactionModal';

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAddTxn, setOpenAddTxn] = useState(false);

  const fetchDashboardData = async () => {
    if(loading) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`
      );
      if(response.data) {
        setDashboardData(response.data);
      }   
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);  
      } finally {
        setLoading(false);
      }
  };   
      
 useEffect(() => {
  fetchDashboardData();
  return () => {};
  }, []);

  return (
   <DashboardLayout activeMenu='Dashboard'>
    <div className='my-5 mx-auto'>
        <div className='grid grid-col-1 md:grid-cols-3 gap-6'>
          <InfoCard
           icon={<IoMdCard />}
           label='Total Balances'
           value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
           color='bg-primary'
          /> 

           <InfoCard
           icon={<LuWalletMinimal/>}
           label='Total Income'
           value={addThousandsSeparator(dashboardData?.totalIncome || 0)}
           color='bg-orange-500'
          /> 

           <InfoCard
           icon={<LuHandCoins />}
           label='Total Expense'
           value={addThousandsSeparator(dashboardData?.totalExpense || 0)}
           color='bg-red-500'
          /> 
        </div> 

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
          <RecentTransactions
            transactions={dashboardData?.recentTransactions || []}
            onSeeMore={() => navigate('/expense')}
          />
        
         <FinanceOverview
          totalBalance={dashboardData?.totalBalance || 0}
          totalIncome={dashboardData?.totalIncome || 0}
          totalExpense={dashboardData?.totalExpense || 0} 
         />

         <ExpenseTransactions
          transactions={dashboardData?.last30DaysExpenses?.transactions || []}
          onSeeMore={() => navigate('/expense')}
         />

         <Last30DaysExpenses
          data={dashboardData?.last30DaysExpenses?.transactions || []}
         />

         <RecentIncomeWithChart
          data={dashboardData?.last60DaysIncome?.transactions?.slice(0,4) || []}
          totalIncome={dashboardData?.totalIncome || 0}
         />

         <RecentIncome
          transactions={dashboardData?.last60DaysIncome?.transactions || []}
          onSeeMore={() => navigate('/income')}
         />
        </div>
       
       {/* Floating add button */}
       <button
         onClick={() => setOpenAddTxn(true)}
         className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg z-50"
         aria-label="Add transaction"
       >
         <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
       </button>

       <AddTransactionModal isOpen={openAddTxn} onClose={() => setOpenAddTxn(false)} onSuccess={() => fetchDashboardData()} />
    </div>
   </DashboardLayout>
  )
};

export default Home
