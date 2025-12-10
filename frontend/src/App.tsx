import { useWallet } from './hooks/useWallet';
import { Header } from './components/Header';
import { SwapInterface } from './components/SwapInterface';

function App() {
  const wallet = useWallet();

  return (
    <div className="container">
      <div className="swap-card">
        <Header wallet={wallet} />
        <SwapInterface wallet={wallet} />
      </div>
    </div>
  );
}

export default App;
