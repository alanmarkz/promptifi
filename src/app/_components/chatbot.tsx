"use client";

import { useState, useEffect, useRef } from "react";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";
import { ClientMessage } from "../_components/Transaction";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl w-96 h-[600px] flex flex-col">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Sonic Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {conversation.length === 0 ? (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-800 text-center">
                  Hi there! I&apos;m your crypto assistant. How can I help you
                  today? 🚀
                </p>
              </div>
            ) : (
              conversation.map((message: ClientMessage, index: number) => {
                const isLastMessage = index === conversation.length - 1;
                return (
                  <div
                    key={message.id}
                    ref={isLastMessage ? messagesEndRef : null}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl max-w-[80%] ${
                        message.role === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.display}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="p-4 border-t border-gray-200"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!input.trim()) return;

              const userMessage = {
                id: generateId(),
                role: "user",
                display: input,
              };
              setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                userMessage,
              ]);
              setInput("");

              const botMessage = await continueConversation(input);
              setConversation((currentConversation: ClientMessage[]) => [
                ...currentConversation,
                botMessage,
              ]);
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-grow rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Type your message..."
              />
              <button
                type="submit"
                className="bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
