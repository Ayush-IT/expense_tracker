import {
    LuLayoutDashboard,
    LuHandCoins,
    LuWalletMinimal,
    LuReceiptText,
    LuChartLine,
    LuLogOut,
    LuUser,
} from 'react-icons/lu';

export const SIDE_MENU_DATA = [
    {
        id: "01",
        label: "Dashboard",
        icon: LuLayoutDashboard,
        path: "/dashboard",
    },
    {
        id: "02",
        label: "Income",
        icon: LuWalletMinimal,
        path: "/income",
    },
    {
        id: "03",
        label: "Expense",
        icon: LuHandCoins,
        path: "/expense",
    },
    {
        id: "04",
        label: "Bills",
        icon: LuReceiptText,
        path: "/bills",
    },
    {
        id: "05",
        label: "Budgets",
        icon: LuChartLine,
        path: "/budgets",
    },
    {
        id: "06",
        label: "Profile",
        icon: LuUser,
        path: "/profile",
    },
    {
        id: "07",
        label: "Logout",
        icon: LuLogOut,
        path: "/logout",
    },
];

  