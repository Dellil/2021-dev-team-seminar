// PSEUDO CODE
const EXAMPLE = (props: EXAMPLEProps) => {
  const [mode, setMode] = useState<'DEFAULT' | 'SELECT' | 'SEARCH'>('DEFAULT');

  return (
    <PageContainer>
      {mode === `DEFAULT` && <TobBar left={} right={} />}
      {mode === 'SELECT' && (
        <>
          <Spacing />
          <Flex>
            <Toolbar
            // ...어쩌구저쩌구
            />
          </Flex>
        </>
      )}
      {mode === 'SEARCH' && (
        <>
          <SearchTopbar>
            <IconBack
              onClick={() => {
                setMode('DEFAULT');
              }}
            />
            <SearchBar />
          </SearchTopbar>
          <Spacing.Vertical height={56} />
        </>
      )}
      {mode === 'SELECT' && (
        <Spacing.Vertical />
        <Toolbar />
        <다른컴포넌트 />
      )}
      {['SELECT', 'DEFAULT'].includes(mode) && (
        fileStore.hasInit &&
        fileStore.uploadedFiles.length === 0 && (
          <Placeholder>
            <IconFilePlaceholder />
            <PlaceholderLabel>It's empty!</PlaceholderLabel>
            {mode === 'DEFAULT' && (
              <PlaceholderSub>
                아래 업로드 버튼
                <PlaceholderLabelIcon>
                  <IconPlusFab size={14} />
                </PlaceholderLabelIcon>
                {`을 눌러\n 파일을 업로드 해보세요`}
              </PlaceholderSub>
            )}
          </Placeholder>
        )
      )}
      {fileStore.hasInit && Object.keys(fileStore.filesObject).length > 0 && (
        <FilesContainer>
          {!fileStore.hasInit && <FileSkeletonItem />}
          {fileStore.hasInit && fileStore.isListView && (
            <FileList
              // ...props
            />
          )}

          {fileStore.hasInit && !fileStore.isListView && (
            <FileGrid
              // ...props
            />
          )}
        </FilesContainer>
      )}
    </PageContainer>
  );
};

export default EXAMPLE;
