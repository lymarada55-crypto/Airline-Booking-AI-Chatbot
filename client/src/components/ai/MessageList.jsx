import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({
  messages,
  isSending,
  onQuickReply,
  onSelectFlight,
  onEditMessage,
  onNavigateClose,
  savedIdSet,
  onToggleSave,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1 || isSending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isSending]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-white px-5 pt-5 pb-4 sm:px-6">
      {messages.map((message, idx) => (
        <MessageBubble
          key={message.id}
          message={message}
          isFirstMessage={idx === 0}
          onQuickReply={onQuickReply}
          onSelectFlight={onSelectFlight}
          onEditMessage={onEditMessage}
          onNavigateClose={onNavigateClose}
          isSaved={savedIdSet?.has(message.id)}
          onToggleSave={onToggleSave}
          disabled={isSending}
        />
      ))}

      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
