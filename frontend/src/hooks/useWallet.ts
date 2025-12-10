declare global {
    interface Window {
        ethereum: any;
    }
}

import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, formatUnits } from 'ethers';
import { CONTRACTS, ARC_TESTNET_CHAIN_ID, ARC_TESTNET_CHAIN_ID_HEX, RPC_URL, EXPLORER_URL } from '../utils/contracts';

const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

export function useWallet() {
    const [account, setAccount] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [balances, setBalances] = useState<{ USDC: string; EURC: string }>({ USDC: '0.0', EURC: '0.0' });

    useEffect(() => {
        if (window.ethereum) {
            const providerInstance = new BrowserProvider(window.ethereum);
            setProvider(providerInstance);

            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) setAccount(accounts[0]);
                else setAccount(null);
            });

            window.ethereum.on('chainChanged', (chainIdHex: string) => {
                setChainId(parseInt(chainIdHex, 16));
            });

            // Check initial state ONLY if not manually disconnected
            const isManualDisconnect = localStorage.getItem('isManualDisconnect') === 'true';

            if (!isManualDisconnect) {
                providerInstance.send("eth_accounts", []).then((accounts) => {
                    if (accounts.length > 0) setAccount(accounts[0]);
                });
            }

            providerInstance.getNetwork().then((network) => {
                setChainId(Number(network.chainId));
            });
        }
    }, []);

    const connect = async () => {
        if (!provider) return;
        try {
            localStorage.removeItem('isManualDisconnect'); // Clear flag
            const accounts = await provider.send("eth_requestAccounts", []);
            if (accounts.length > 0) setAccount(accounts[0]);
        } catch (error) {
            console.error("Connection failed", error);
        }
    };

    const disconnect = () => {
        setAccount(null);
        localStorage.setItem('isManualDisconnect', 'true'); // Set flag
    };

    const switchNetwork = async () => {
        if (!provider) return;
        try {
            await provider.send("wallet_switchEthereumChain", [{ chainId: ARC_TESTNET_CHAIN_ID_HEX }]);
        } catch (error: any) {
            if (error.code === 4902) {
                // Add network
                await provider.send("wallet_addEthereumChain", [{
                    chainId: ARC_TESTNET_CHAIN_ID_HEX,
                    chainName: "Arc Testnet",
                    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 }, // Gas token is USDC (Native 18)
                    rpcUrls: [RPC_URL],
                    blockExplorerUrls: [EXPLORER_URL]
                }]);
            } else {
                console.error("Failed to switch network", error);
                throw error;
            }
        }
    };

    const loadBalances = async () => {
        if (!account || !provider || chainId !== ARC_TESTNET_CHAIN_ID) return;

        try {
            // Create Contract instances
            const eurcContract = new Contract(CONTRACTS.EURC, ERC20_ABI, provider);

            // Fetch Raw Balances
            // USDC is Native, so we can use getBalance for gas, BUT 'USDC' token contract also exists?
            // On Arc Testnet, USDC is the native gas token. so provider.getBalance(account) gives USDC.
            // However, check if Wrapped USDC exists.
            // Based on previous HTML code:
            // USDC Balance was fetched via eth_getBalance (Native) in the END.
            // Wait, let's look at previous code logic in HTML.
            // It used `eth_getBalance` for USDC (Native) and `ERC20` calls for EURC.

            const usdcNativeBalance = await provider.getBalance(account);
            const eurcBalance = await eurcContract.balanceOf(account);

            // USDC (Native) -> 18 decimals
            // EURC (ERC20) -> 6 decimals

            setBalances({
                USDC: formatUnits(usdcNativeBalance, 18),
                EURC: formatUnits(eurcBalance, 6)
            });
        } catch (error) {
            console.error("Failed to load balances", error);
        }
    };

    useEffect(() => {
        if (account && chainId === ARC_TESTNET_CHAIN_ID) {
            loadBalances();
        }
    }, [account, chainId]);

    return {
        account,
        chainId,
        provider,
        balances,
        connect,
        disconnect,
        switchNetwork,
        loadBalances,
        isArcTestnet: chainId === ARC_TESTNET_CHAIN_ID
    };
}
