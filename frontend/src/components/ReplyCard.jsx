import React from "react";

const ReplyCard = ({ reply, onReply }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [value, setValue] = React.useState("");

  // If this reply has sub-replies, use grid layout
  const hasReplies = reply.replies.length > 0;

  return (
    <div className={hasReplies ? "grid grid-cols-2 gap-4 p-2 border rounded bg-gray-50" : "reply-wrapper border p-2 rounded bg-white"}>
      {/* Left Card - The reply itself */}
      <div className={hasReplies ? "p-2 bg-white border rounded" : ""}>
        <div className="meta text-sm text-gray-600 mb-1">
          {reply.author} replied • {reply.timestamp} • Replies: {reply.replies.length}
        </div>
        <div className="content mb-2">{reply.text}</div>

        <div className="controls flex gap-2 mb-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Reply this Answer
          </button>
        </div>

        {showForm && (
          <div className="reply-form flex flex-col mt-2">
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Reply..."
              className="w-full p-2 border rounded mb-1"
            />
            <button
              onClick={() => { onReply(reply.id, value); setValue(""); setShowForm(false); }}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Post Reply
            </button>
          </div>
        )}
      </div>

      {/* Right Card - Child replies (only if they exist) */}
      {hasReplies && (
        <div className="p-2 bg-yellow-50 border rounded space-y-2">
          {reply.replies.map(r => (
            <ReplyCard key={r.id} reply={r} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReplyCard;
