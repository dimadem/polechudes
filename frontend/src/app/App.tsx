import { useLaunchParams } from '@telegram-apps/sdk-react';

function MyComponent() {
  const params = useLaunchParams();
  // params.tgWebAppData.user, params.tgWebAppData.query_id и т.д.
  return <div>Hello, {params?.tgWebAppData?.user?.first_name}</div>;
}

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <MyComponent />
    </div>
  )
}

export default App