import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A very simple formatter for legal text requirements (Bold, Tables, Lists)
// Not a full markdown parser, but sufficient for the prompt's requirements
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    // Header detection (simple #)
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-bold text-emerald-800 mt-4 mb-2">{formatInline(line.replace('### ', ''))}</h3>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-bold text-emerald-900 mt-5 mb-2 border-b border-emerald-200 pb-1">{formatInline(line.replace('## ', ''))}</h2>;
    }
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold text-emerald-950 mt-6 mb-3">{formatInline(line.replace('# ', ''))}</h1>;
    }

    // List detection
    if (line.trim().startsWith('- ')) {
      return (
        <li key={index} className="ml-4 list-disc pl-1 text-gray-800 leading-relaxed">
          {formatInline(line.trim().substring(2))}
        </li>
      );
    }

    // Table row detection (basic)
    if (line.includes('|') && line.trim().startsWith('|')) {
        const cells = line.split('|').filter(c => c.trim() !== '');
        // Check if it's a separator line (---)
        if (cells.some(c => c.includes('---'))) return null;

        return (
            <div key={index} className="grid grid-flow-col auto-cols-fr gap-2 border-b border-gray-300 py-2 bg-white/50">
                {cells.map((cell, idx) => (
                    <div key={idx} className={`text-sm ${index === 0 ? 'font-bold bg-gray-100' : ''} p-1`}>
                        {formatInline(cell.trim())}
                    </div>
                ))}
            </div>
        )
    }

    // Empty line
    if (line.trim() === '') {
      return <div key={index} className="h-3"></div>;
    }

    // Paragraph
    return <p key={index} className="mb-2 text-gray-800 leading-relaxed">{formatInline(line)}</p>;
  };

  const formatInline = (text: string): React.ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-emerald-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Grouping for lists and tables would be ideal, but for this simple implementation:
  return (
    <div className="text-sm md:text-base font-sans">
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  );
};

export default MarkdownRenderer;
