import { useWallet } from '../hooks/useWallet';

interface HeaderProps {
    wallet: ReturnType<typeof useWallet>;
}

export function Header({ wallet }: HeaderProps) {
    const { account, disconnect, isArcTestnet, switchNetwork } = wallet;

    return (
        <>
            <div className="card-header">
                <h2 className="card-title">Swap</h2>
                <div className="network-badge">Arc Testnet</div>
            </div>

            {account ? (
                <div className="wallet-section">
                    <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={disconnect}>
                        Disconnect
                    </button>
                </div>
            ) : null}

            {!isArcTestnet && account && (
                <div className="status-msg status-error" style={{ marginBottom: '20px', cursor: 'pointer' }} onClick={switchNetwork}>
                    ⚠ Wrong Network. Click to Switch to Arc.
                </div>
            )}
        </>
    );
}
