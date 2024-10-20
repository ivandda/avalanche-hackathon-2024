'use client'
import PoolCard from "./cards/PoolCard";
import VoucherBalance from "./cards/VoucherBalance";

import { http, createConfig, WagmiProvider } from 'wagmi';
import {
  avalancheFuji
} from 'wagmi/chains';

const config = createConfig({
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http(
      `https://avalanche-fuji.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`,
    ),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const StudentDashboard: React.FC = () => {
  return (
    <WagmiProvider config={config}>
    <div className="h-full lg:px-6 dark">
    <div className="flex justify-center gap-4 xl:gap-6 pt-3 px-4 lg:px-0  flex-wrap xl:flex-nowrap sm:pt-10 max-w-[90rem] mx-auto w-full">
      <div className="mt-6 gap-6 flex flex-col w-full">
        {/* Card Section Top */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Available Balance</h3>
          <div className="grid md:grid-cols-2 grid-cols-1 2xl:grid-cols-3 gap-5  justify-center w-full">
            <PoolCard />
            <VoucherBalance />
          </div>
        </div>

        {/* Chart */}
        <div className="h-full flex flex-col gap-2">
          <h3 className="text-xl font-semibold">Applications</h3>
          {/* <TableWrapper />  */}
        </div>
      </div>

      {/* Left Section */}
      <div className="mt-4 gap-2 flex flex-col xl:max-w-md w-full">
        <h3 className="text-xl font-semibold">Section</h3>
        <div className="flex flex-col justify-center gap-4 flex-wrap md:flex-nowrap md:flex-col">
          {/* <CardAgents /> */}
          {/* <CardTransactions /> */}
        </div>
      </div>
    </div>

    {/* Table Latest Users */}
    <div className="flex flex-col justify-center w-full py-5 px-4 lg:px-0  max-w-[90rem] mx-auto gap-3">
      {/* <div className="flex  flex-wrap justify-between">
        <h3 className="text-center text-xl font-semibold">Latest Users</h3>
        <Link
          href="/accounts"
          as={NextLink}
          color="primary"
          className="cursor-pointer"
        >
          View All
        </Link>
      </div>
      <TableWrapper /> */}
    </div>
  </div>
  </WagmiProvider>
  );
}

export default StudentDashboard;
