// import { useLaunchParams } from '@telegram-apps/sdk-react';
import { CrosswordWidget } from '@/widgets/crossword';
// import TestApp from '../TestApp'

function App() {
  // const params = useLaunchParams();
  
  const handleGameComplete = (score: number) => {
    console.log('Игра завершена! Счет:', score);
  };

  return (
    <div className="min-h-svh">
      {/* <div>Hello, {params?.tgWebAppData?.user?.first_name}</div> */}
      <CrosswordWidget 
        difficulty="medium"
        onGameComplete={handleGameComplete}
      />
      {/* <TestApp /> */}
    </div>
  )
}

export default App