"use client";

import { useState, useEffect, useRef } from "react";
import { useActions, useUIState } from "ai/rsc";
import { generateId } from "ai";
import { ClientMessage } from "./_components/Transaction";

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [conversation, setConversation] = useUIState();
  const { continueConversation } = useActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom whenever the conversation updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-blue-50 flex items-center justify-center pt-24 pb-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl flex flex-col mb-5">
        <div className="flex-grow p-6 overflow-y-auto h-full max-h-[80vh] space-y-4">
          {conversation.length === 0 ? (
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-gray-800 text-center text-lg font-medium">
                Hi there! I&apos;m a crypto bot assistant. I can provide
                real-time token prices, facilitate swaps, and bridge assets
                across blockchains. How can I assist you today? 🚀
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
                    className={`p-4 rounded-xl h-full w-fit max-w-[80%] ${
                      message.role === "user"
                        ? "bg-blue-500 text-white self-end"
                        : "bg-gray-100 text-gray-800 self-start"
                    }`}
                  >
                    {message.display}
                  </div>
                </div>
              );
            })
          )}
          {/* Dummy div to scroll into view */}
          <div ref={messagesEndRef} />
        </div>
        <form
          className="p-4 border-t border-gray-200 flex items-center"
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
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="flex-grow border rounded-full py-3 px-4 mr-3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 transition duration-200 text-white font-semibold py-3 px-6 rounded-full"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
