export default function QuestionCard({ question }) {
  return (
    <div className="grid grid-cols-2 gap-4 thread-row border-b border-gray-200 pb-4">
      {/* Left column: Question */}
      <div className="left-cell">
        <div className="left-card bg-blue-50 p-3 rounded border border-blue-200">
          <div className="meta text-sm text-gray-600 mb-2">
            Question • {question.author} • {question.timestamp} • {question.id} •{" "}
            {question.replies.length} Replies
            <span className="tag ml-2 text-blue-600">[{question.tag}]</span>
          </div>
          <div className="content text-sm mb-2">{question.text}</div>
          <div className="controls flex gap-2">
            <button className="btn bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Reply this question
            </button>
          </div>
        </div>
      </div>

      {/* Right column: Placeholder Answer */}
      <div className="right-cell">
        <div className="right-card bg-orange-50 p-3 rounded border border-orange-200">
          <div className="meta text-sm text-gray-600 mb-2">
            {/* Placeholder: replies will go here */}
            {question.replies.length > 0
              ? `${question.replies.length} Replies`
              : "No replies yet"}
          </div>
          <div className="content text-sm mb-2">
            {question.replies.length > 0
              ? question.replies.map((r) => r.text).join(", ")
              : "No answers yet"}
          </div>
          <div className="controls flex gap-2">
            <button className="btn bg-gray-100 text-gray-700 px-2 py-1 rounded">👍</button>
            <button className="btn bg-gray-100 text-gray-700 px-2 py-1 rounded">👎</button>
            <button className="btn bg-blue-100 text-blue-600 px-2 py-1 rounded">
              Reply this Answer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
