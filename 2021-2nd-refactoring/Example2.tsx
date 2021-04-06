// PSEUDO CODE
const EXAMPLE = (props: EXAMPLEProps) => {
  const [mode, setMode] = useState<'DEFAULT' | 'SELECT' | 'SEARCH'>('DEFAULT');

  return (
    <>
      {
        mode === 'DEFAULT' && (
          <Topbar />
          <Toolbar />
          // ...다른 컴포넌트들
        )
      }
      {
        mode === 'SELECT' && (
          <Topbar />
          <Toolbar />
          // ...다른 컴포넌트들
        )
      }
      {
        mode === 'SEARCH' && (
          <Topbar />
          <Toolbar />
          // ...다른 컴포넌트들
        )
      }
    </>
  );
};

export default EXAMPLE;
ß