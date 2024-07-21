import React, { DragEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "./ui/use-toast"
import MarkdownRenderer from "./ui/markdown-renderer"

import axios from "axios"

interface ResponseProps {
  answer: string;
  sources: string[];
}

interface Message {
  sender: 'user' | 'server';
  text: string | ResponseProps;
}

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')

  const { toast } = useToast(); // Initialize toast function


  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile)
      setChatOpen(true)
    } else {
      alert("Please upload a PDF file.")
    }
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    
    e.preventDefault();
    if (!file) return;
    setIsUploaded(false);
    toast({description: "Uploading file...",});	

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/upload', formData);
      setIsUploaded(true);
      toast({description: "File uploaded Successfully!",});
      setChatOpen(true);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Function to handle sending messages
  const sendMessage = async () => {
    const userMessage = userInput;
    setUserInput(''); // Clear input after sending

    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userMessage }]);

    try {
      // Replace URL with your server's endpoint
      const response = await axios.post('http://localhost:8000/query', { query: userMessage });
      console.log(response.data)
      const serverMessage = response?.data?.response; // Assuming the response contains a message

      // Add server response to chat
      setMessages((prevMessages) => [...prevMessages, { sender: 'server', text: serverMessage }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [...prevMessages.slice(0, -1)]); // Remove user message from chat if sending failed
    }
  };

  const handleDeleteDb = () => {
    try {
      axios.delete('http://localhost:8000/delete');
      toast({description: "Data deleted Successfully!",});
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <h1 className="text-2xl font-bold">PageSage</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center">
        {!file && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-primary-foreground rounded-lg p-12 text-center cursor-pointer hover:bg-primary/10 transition-colors"
          >
            <UploadIcon className="w-12 h-12 mb-4 text-primary-foreground" />
            <h2 className="text-xl font-bold mb-2">Drag and drop a PDF file</h2>
            {/* <p className="text-muted-foreground">or click to upload</p> */}
          </div>
        )}
        {file && (
          <div className="w-full max-w-4xl">
            <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">PDF Added: {file.name}</h2>
              {!isUploaded && (<div className="flex justify-end">
                <Button variant="secondary" onClick={handleSubmit} className="mr-2">
                  Upload PDF
                </Button>
                <Button variant="destructive" onClick={() => setFile(null)}>
                  Remove
                </Button>
              </div>)}
              { isUploaded && (
                <div className="flex justify-end">
                  <Button variant="destructive" onClick={handleDeleteDb}>Delete Data</Button>
                </div>
              )}
            </div>
            {chatOpen && (
              <div className="bg-card text-card-foreground rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-xl font-bold mb-4">Chat with AI Assistant</h2>
                <div className="h-96 overflow-y-auto">
                    <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-10 h-10 border">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>S</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-bold">Sage</div>
                      <div className="prose text-muted-foreground">
                        <p>
                         Hello, I&apos;m Sage, here to help you with your document. How can I assist you today?
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {messages.map((msg, index) => (
                    <div key={index} className="flex items-start gap-4 mb-4">
                      <Avatar className="w-10 h-10 border">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback>{msg.sender === 'user' ? "U" : "S"}</AvatarFallback>:
                      </Avatar>
                      <div className="grid gap-1">
                        <div className="font-bold">{msg.sender === 'user' ? 'You' : 'Sage'}</div>
                        <div className="prose text-muted-foreground">
                          <p>
                            <MarkdownRenderer content={typeof msg.text === 'string' ? msg.text : (msg.text as ResponseProps).answer} />
                          </p>
                        </div>
                        {typeof msg.text !== 'string' && (<div className="bg-zinc-300 p-2 rounded-sm flex gap-4">{typeof msg.text !== 'string' && (msg.text as ResponseProps).sources.map((doc, index) => (<div key={index} className="text-sm text-muted-foreground bg-zinc-400/20 px-2 rounded-sm">{doc}</div>))}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-lg border border-input bg-input p-2 text-input-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    disabled={!isUploaded}
                  />
                  <div className="flex justify-end mt-2">
                    <Button disabled={!isUploaded || !userInput.trim()} onClick={sendMessage}>Send</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}


interface UploadIconProps extends React.SVGProps<SVGSVGElement> {
    // You can add any additional custom props here
}

function UploadIcon(props: UploadIconProps) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}


// function XIcon(props: UploadIconProps) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M18 6 6 18" />
//       <path d="m6 6 12 12" />
//     </svg>
//   )
// }



export default FileUpload