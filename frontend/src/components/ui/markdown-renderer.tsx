import ReactMarkdown from 'react-markdown';
// import Prism from 'react-syntax-highlighter';
// import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        // code({node, inline, className, children, ...props}) {
        //   const match = /language-(\w+)/.exec(className || '')
        //   return !inline && match ? (
        //     <Prism
        //       style={solarizedlight}
        //       language={match[1]}
        //       PreTag="div"
        //       {...props}
        //     >
        //       {String(children).replace(/\n$/, '')}
        //     </Prism>
        //   ) : (
        //     <code className={className} {...props}>
        //       {children}
        //     </code>
        //   )
        // }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;