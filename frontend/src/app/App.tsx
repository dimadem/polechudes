// import { useLaunchParams } from '@telegram-apps/sdk-react';
import { CrosswordWidget } from '@/widgets/crossword';

function App() {
  // const params = useLaunchParams();
  
  const handleGameComplete = (score: number) => {
    console.log('Игра завершена! Счет:', score);
    // Здесь можно добавить логику для Telegram интеграции
    // Например, отправить результат в бот или показать модальное окно
  };

  return (
    <div className="min-h-svh">
      {/* <div>Hello, {params?.tgWebAppData?.user?.first_name}</div> */}
      <CrosswordWidget 
        difficulty="medium"
        onGameComplete={handleGameComplete}
      />
    </div>
  )
}

export default App