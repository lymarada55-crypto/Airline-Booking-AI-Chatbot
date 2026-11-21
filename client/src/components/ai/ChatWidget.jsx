// eslint-disable-next-line no-unused-vars
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";
import { useChat } from "../../hooks/useChat";
import ChatWindow from "./ChatWindow";

/**
 * Bong bóng chat nổi ở mọi trang, mở/đóng khung trợ lý AI.
 */
export default function ChatWidget() {
  const { isOpen, toggle, close } = useChat();
  const dragConstraintsRef = useRef(null);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-label="Đóng trợ lý AI"
            className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{isOpen && <ChatWindow />}</AnimatePresence>

      <div ref={dragConstraintsRef} className="fixed inset-0 z-50 pointer-events-none">
        <motion.div
          drag
          dragConstraints={dragConstraintsRef}
          dragMomentum={false}
          className="pointer-events-auto fixed bottom-6 right-4 md:right-6"
        >
          {!isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-4 w-4"
            >
              <span
                className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"
                style={{ borderRadius: 9999 }}
              />
              <span
                className="relative inline-flex h-4 w-4 bg-emerald-500 border-2 border-white"
                style={{ borderRadius: 9999 }}
              />
            </motion.span>
          )}

          <motion.button
            type="button"
            onClick={toggle}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI"}
            className="flex h-14 w-14 cursor-pointer items-center justify-center text-white shadow-xl transition-shadow"
            style={{
              borderRadius: 9999,
              border: "none",
              background: isOpen
                ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                : "linear-gradient(135deg, #0b5ed7 0%, #1d75f2 100%)",
              boxShadow: isOpen
                ? "0 12px 28px rgba(15, 23, 42, 0.35)"
                : "0 12px 28px rgba(13, 97, 225, 0.40)",
            }}
          >
            {isOpen ? (
              <X size={24} weight="bold" />
            ) : (
              <PaperPlaneTilt size={26} weight="fill" />
            )}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
