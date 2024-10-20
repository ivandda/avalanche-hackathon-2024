import { NextRequest, NextResponse } from 'next/server';
// import Moralis from 'moralis';
// import dbConnect from '@/lib/dbConnect';
// import { Government } from "@/models";

//This API interfaces with the government's educational funding pool,
// a diverse portfolio of assets dedicated to supporting and guaranteeing public education founds.
//  The endpoint is designed to be called by Chainlink Functions within the
//  CheckPoolFounds smart contract

// This endpoint works on main net, but we are using testnet for this project, so the usd_value of the tokens is always cero.
// Because of this, we are going to use a mock api call to Moralis to get the totalUsdValue of the wallet.


// // Initialize Moralis
// Moralis.start({
//   apiKey: process.env.MORALIS_APP_KEY
// });
//
// export async function GET(request: NextRequest) {
//   await dbConnect();
//
//   const searchParams = request.nextUrl.searchParams;
//   const walletAddress = searchParams.get('walletAddress');
//
//   if (!walletAddress) {
//     return NextResponse.json({ message: 'Invalid wallet address' }, { status: 400 });
//   }
//
//   try {
//     const government = await Government.findOne({ walletAddress });
//
//     if (!government) {
//       return NextResponse.json({ message: 'Government wallet not found' }, { status: 404 });
//     }
//
//     let totalUsdValue = 0;
//
//     for (const chain of government.whiteListedBlockchains) {
//       try {
//         const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
//           chain,
//           address: walletAddress,
//         });
//
//         console.log(`Balance for chain ${chain}:`, response.result);
//         for (const token of response.result) {
//           totalUsdValue += parseFloat(token["usd_value"]) || 0;
//         }
//       } catch (error) {
//         console.error(`Error fetching balance for chain ${chain}:`, error);
//         // Continue with the next chain if there's an error
//       }
//     }
//
//     return NextResponse.json({
//       totalUsdValue: totalUsdValue.toFixed(2),
//       date: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Error in wallet balance API:', error);
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//   }
// }


// For the demo and MVP we are going to use a mock api call to Moralis

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const walletAddress = searchParams.get('walletAddress');

  if (!walletAddress) {
    return NextResponse.json({ message: 'Invalid wallet address' }, { status: 400 });
  }

  const tokenBalancesAndPrices = [
      { tokenBalance: 10, tokenUsdValue: 2000, tokenSymbol: 'ETH' },
      { tokenBalance: 5, tokenUsdValue: 30, tokenSymbol: 'AVAX' },
      { tokenBalance: 1000, tokenUsdValue: 1, tokenSymbol: 'USDT' },
      { tokenBalance: 50, tokenUsdValue: 25, tokenSymbol: 'SOL' },
      { tokenBalance: 0.5, tokenUsdValue: 30000, tokenSymbol: 'BTC' },
      { tokenBalance: 100, tokenUsdValue: 0.5, tokenSymbol: 'XRP' },
      { tokenBalance: 20, tokenUsdValue: 150, tokenSymbol: 'BNB' },
      { tokenBalance: 75, tokenUsdValue: 1, tokenSymbol: 'DAI' },
      { tokenBalance: 1000, tokenUsdValue: 1000, tokenSymbol: 'T_BOND' },// Tokenized Treasury Bonds
      { tokenBalance: 500, tokenUsdValue: 10000, tokenSymbol: 'NAT_LAND' }, // Tokenized National Land
      { tokenBalance: 100000, tokenUsdValue: 50, tokenSymbol: 'OIL_RES' }, // Tokenized Oil Reserves
];

  function calculateTotalUsdValue(tokens: { tokenBalance: number, tokenUsdValue: number }[]): number {
    return tokens.reduce((total, token) => total + (token.tokenBalance * token.tokenUsdValue), 0);
  }

  const totalUsdValue = calculateTotalUsdValue(tokenBalancesAndPrices);
  return NextResponse.json({ totalUsdValue: totalUsdValue.toFixed(2) });
}