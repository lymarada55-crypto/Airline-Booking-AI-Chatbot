// eslint-disable-next-line no-unused-vars
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { useChat } from "../../hooks/useChat";
import ChatWindow from "./ChatWindow";
import { SkyGenieMascotSvg } from "./AssistantAvatar";

/**
 * Floating TripGenie-style SkyAI Mascot Button ở góc dưới phải mọi trang.
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
            className="fixed inset-0 z-[105] cursor-default bg-slate-900/35 backdrop-blur-[2px]"
            style={{ border: "none", padding: 0 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>{isOpen && <ChatWindow />}</AnimatePresence>

      {!isOpen && (
        <div ref={dragConstraintsRef} className="fixed inset-0 z-50 pointer-events-none">
          <motion.div
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            className="pointer-events-auto fixed bottom-6 right-4 md:right-6"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 z-10 flex h-3.5 w-3.5"
            >
              <span
                className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"
                style={{ borderRadius: 9999 }}
              />
              <span
                className="relative inline-flex h-3.5 w-3.5 bg-emerald-500 border-2 border-white"
                style={{ borderRadius: 9999 }}
              />
            </motion.span>

            <motion.button
              type="button"
              onClick={toggle}
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Mở trợ lý SkyAI"
              className="relative flex cursor-pointer flex-col items-center justify-center text-white transition-shadow"
              style={{
                width: 62,
                height: 62,
                borderRadius: 9999,
                border: "2px solid rgba(255, 255, 255, 0.85)",
                background: "radial-gradient(circle at 30% 25%, #3b82f6 0%, #1d4ed8 58%, #1e1b4b 100%)",
                boxShadow:
                  "0 12px 30px rgba(29, 78, 216, 0.48), inset 0 1px 4px rgba(255,255,255,0.45)",
                padding: 0,
              }}
            >
              <div style={{ marginTop: -4 }}>
                <SkyGenieMascotSvg size={38} />
              </div>
              <span
                className="absolute -bottom-1 inline-flex items-center justify-center font-black uppercase tracking-wider text-white shadow-sm"
                style={{
                  fontSize: 9,
                  lineHeight: "13px",
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "linear-gradient(90deg, #818cf8 0%, #3b82f6 100%)",
                  border: "1px solid rgba(255,255,255,0.65)",
                  letterSpacing: "0.08em",
                }}
              >
                SKY AI
              </span>
            </motion.button>
          </motion.div>
        </div>
      )}
    </>
  );
}
