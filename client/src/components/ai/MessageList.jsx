import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ messages, isSending, onQuickReply, onSelectFlight, onEditMessage }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (messages.length > 1 || isSending) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isSending]);

  return (
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-3 bg-[#f8fbff]">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onQuickReply={onQuickReply}
          onSelectFlight={onSelectFlight}
          onEditMessage={onEditMessage}
          disabled={isSending}
        />
      ))}

      {isSending && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
