import { Routes, Route } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      {/* Le rotte reali (login, logout, gruppo protetto con le entità)
          verranno definite nei blocchi G/H. */}
      <Route path="/" element={<p>Sistema di pianificazione degli appelli</p>} />
    </Routes>
  );
}

export default App;
