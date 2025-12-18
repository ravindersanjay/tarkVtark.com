import React from "react";
import ReplyCard from "./ReplyCard";

const QuestionColumn = ({ debateData, setDebateData }) => {
  const handleReply = (parentId, text) => {
    if (!text) return alert("Enter reply");

    const newReply = {
      id: Date.now(),
      text,
      author: "CurrentUser",
      timestamp: new Date().toLocaleString(),
      replies: []
    };

    // Recursive function to find parent
    const addReply = (arr) => {
      return arr.map(q => {
        if (q.id === parentId) {
          return { ...q, replies: [...q.replies, newReply] };
        } else if (q.replies.length > 0) {
          return { ...q, replies: addReply(q.replies) };
        }
        return q;
      });
    };

    setDebateData(prev => ({
      ...prev,
      questions: addReply(prev.questions)
    }));
  };

  return (
    <div className="space-y-4">
      {debateData.questions.map((q) => (
        <div key={q.id} className="grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50">
          {/* Left Card */}
          <div className="left-card p-2 bg-blue-50 border rounded">
            <div className="meta text-sm text-gray-600 mb-1">
              Question • {q.author} • {q.timestamp} • Replies: {q.replies.length} • [{q.tag}]
            </div>
            <div className="content">{q.text}</div>
            <div className="controls mt-2">
              <ReplyForm parentId={q.id} onReply={handleReply} />
            </div>
          </div>

          {/* Right Card */}
          <div className="right-card p-2 bg-yellow-50 border rounded space-y-2">
            {q.replies.map(r => (
              <ReplyCard key={r.id} reply={r} onReply={handleReply} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Reply form used in left card
const ReplyForm = ({ parentId, onReply }) => {
  const [value, setValue] = React.useState("");
  return (
    <div className="flex flex-col mt-2">
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Reply..."
        className="w-full p-2 border rounded mb-1"
      />
      <button
        onClick={() => { onReply(parentId, value); setValue(""); }}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Reply
      </button>
    </div>
  );
};

export default QuestionColumn;
