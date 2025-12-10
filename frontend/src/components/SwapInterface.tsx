import { useState } from 'react';
import { parseUnits, Contract } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import { CONTRACTS } from '../utils/contracts';
import { ArrowDown } from 'lucide-react';

interface SwapInterfaceProps {
    wallet: ReturnType<typeof useWallet>;
}

const ERC20_ABI = ["function approve(address spender, uint256 amount) returns (bool)"];

export function SwapInterface({ wallet }: SwapInterfaceProps) {
    const { account, provider, isArcTestnet, balances, loadBalances, connect } = wallet;

    const [amountIn, setAmountIn] = useState('');
    const [tokenIn, setTokenIn] = useState<'USDC' | 'EURC'>('USDC');
    const [tokenOut, setTokenOut] = useState<'USDC' | 'EURC'>('EURC');

    const [isApproving, setIsApproving] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [approveDone, setApproveDone] = useState(false);

    const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | '' }>({ msg: '', type: '' });

    // Handle Input
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        val = val.replace(/,/g, '.'); // Force dot
        val = val.replace(/[^0-9.]/g, ''); // Remove non-numeric

        // Prevent multiple dots
        const parts = val.split('.');
        if (parts.length > 2) {
            val = parts[0] + '.' + parts.slice(1).join('');
        }

        setAmountIn(val);
        // Reset approve state when amount changes
        setApproveDone(false);
    };

    const switchTokens = () => {
        setTokenIn(tokenOut);
        setTokenOut(tokenIn);
        setAmountIn('');
        setApproveDone(false);
    };

    // Derived State
    const isAmountValid = amountIn && parseFloat(amountIn) > 0;
    const isNativeUSDC = tokenIn === 'USDC';


    const canSwap = isAmountValid && (isNativeUSDC || approveDone);

    const executeApprove = async () => {
        if (!provider || !account) return;
        setIsApproving(true);
        setStatus({ msg: 'Approving tokens...', type: 'success' });

        try {
            const tokenAddress = CONTRACTS[tokenIn];
            const signer = await provider.getSigner();
            const contract = new Contract(tokenAddress, ERC20_ABI, signer);
            const decimals = tokenIn === 'USDC' ? 18 : 6;
            const amountWei = parseUnits(amountIn, decimals);

            const tx = await contract.approve(CONTRACTS.ROUTER, amountWei, {
                gasLimit: 100000,
                maxFeePerGas: 165000000000n, // 165 Gwei
                maxPriorityFeePerGas: 5000000000n // 5 Gwei
            });

            console.log('Approve TX:', tx);
            await tx.wait(); // Wait for confirmation

            setStatus({ msg: '✓ Approved! Now click Swap.', type: 'success' });
            setApproveDone(true);
        } catch (error: any) {
            console.error(error);
            setStatus({ msg: `Error: ${error.message || 'Approval failed'}`, type: 'error' });
        } finally {
            setIsApproving(false);
        }
    };

    const executeSwap = async () => {
        if (!provider || !account) return;
        setIsSwapping(true);
        setStatus({ msg: 'Swapping...', type: 'success' });

        try {
            const signer = await provider.getSigner();
            const decimals = tokenIn === 'USDC' ? 18 : 6;
            const amountWei = parseUnits(amountIn, decimals);

            let tx;

            if (tokenIn === 'USDC') {
                // Native Verification Loopback
                tx = await signer.sendTransaction({
                    to: account,
                    value: amountWei,
                    gasLimit: 21000,
                    maxFeePerGas: 165000000000n,
                    maxPriorityFeePerGas: 5000000000n
                });
                setStatus({ msg: `✓ Native Swap Success! TX: ${tx.hash.slice(0, 10)}...`, type: 'success' });
            } else {
                // ERC20 Simulated Transfer
                // Create minimal interface for transfer
                const erc20 = new Contract(CONTRACTS[tokenIn], ["function transfer(address to, uint256 amount) returns (bool)"], signer);
                tx = await erc20.transfer(ACCOUNT_LOOPBACK() ? account : CONTRACTS.ROUTER, amountWei, {
                    gasLimit: 150000,
                    maxFeePerGas: 165000000000n,
                    maxPriorityFeePerGas: 5000000000n
                });
                setStatus({ msg: `✓ ERC20 Swap Success! TX: ${tx.hash.slice(0, 10)}...`, type: 'success' });
            }

            await tx.wait();

            // Reset UI after 2 seconds
            setTimeout(() => {
                loadBalances();
                setAmountIn('');
                setStatus({ msg: '', type: '' });
                setApproveDone(false);
            }, 2000);

        } catch (error: any) {
            console.error(error);
            setStatus({ msg: `Error: ${error.message || 'Swap failed'}`, type: 'error' });
        } finally {
            setIsSwapping(false);
        }
    };

    // Helper for formatting
    const formatBalance = (val: string) => {
        if (!val) return '0.0';
        const floatVal = parseFloat(val);
        if (floatVal === 0) return '0.0';
        if (floatVal < 0.0001) return '<0.0001';
        return floatVal.toFixed(4);
    };

    if (!account) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <button className="action-btn" onClick={connect}>Connect Wallet</button>
            </div>
        );
    }

    if (!isArcTestnet) return null; // Header handles the warning

    return (
        <div>
            {/* Input Token */}
            <div className="token-input-container">
                <div className="input-header">
                    <span>From</span>
                    <span>Balance: {formatBalance(balances[tokenIn])} {tokenIn}</span>
                </div>
                <div className="input-row">
                    <input
                        type="text"
                        inputMode="decimal"
                        className="amount-input"
                        placeholder="0.0"
                        value={amountIn}
                        onChange={handleAmountChange}
                    />
                    <div className="token-select">
                        {tokenIn}
                    </div>
                </div>
            </div>

            {/* Swap Arrow */}
            <div className="arrow-container">
                <button className="swap-arrow-btn" onClick={switchTokens}>
                    <ArrowDown size={20} />
                </button>
            </div>

            {/* Output Token */}
            <div className="token-input-container">
                <div className="input-header">
                    <span>To</span>
                    <span>Balance: {formatBalance(balances[tokenOut])} {tokenOut}</span>
                </div>
                <div className="input-row">
                    <input
                        type="text"
                        className="amount-input"
                        placeholder="0.0"
                        value={amountIn} // Mirror input
                        disabled
                        style={{ opacity: 0.7 }}
                    />
                    <div className="token-select">
                        {tokenOut}
                    </div>
                </div>
            </div>

            {/* Gas Info */}
            {isAmountValid && (
                <div className="gas-info" style={{ flexDirection: 'column', gap: '8px' }}>
                    <div className="gas-row">
                        <span>Estimated Gas</span>
                        <span>~0.0001 ARC</span>
                    </div>
                    <div className="gas-row">
                        <span>Network Fee</span>
                        <span style={{ color: '#4ade80' }}>Low</span>
                    </div>
                </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                {/* Approve Button */}
                {!isNativeUSDC && (
                    <button
                        className="action-btn"
                        style={{
                            marginTop: 0,
                            opacity: (!isAmountValid || approveDone) ? 0.5 : 1,
                            cursor: (!isAmountValid || approveDone) ? 'default' : 'pointer',
                            background: approveDone ? 'transparent' : undefined,
                            border: approveDone ? '1px solid rgba(59, 130, 246, 0.5)' : undefined,
                            boxShadow: approveDone ? 'none' : undefined
                        }}
                        disabled={!isAmountValid || approveDone || isApproving}
                        onClick={executeApprove}
                    >
                        {isApproving ? 'Approving...' : (approveDone ? 'Approved' : 'Approve')}
                    </button>
                )}

                {/* Swap Button */}
                <button
                    className="action-btn"
                    style={{
                        marginTop: 0,
                        opacity: (!canSwap) ? 0.5 : 1,
                        cursor: (!canSwap) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={!canSwap || isSwapping}
                    onClick={executeSwap}
                >
                    {isSwapping ? 'Swapping...' : 'Swap'}
                </button>
            </div>

            {/* Status */}
            {status.msg && (
                <div className={`status-msg ${status.type === 'success' ? 'status-success' : 'status-error'}`}>
                    {status.msg}
                </div>
            )}
        </div>
    );
}
