import FileUpload from "./components/FileUpload"
import { Toaster } from "./components/ui/toaster"

function App() {
  // const [isFileUploaded, setIsFileUploaded] = useState(false);

  return (
    <>
      <FileUpload />
      <Toaster />
    </>
  )
}

export default App
