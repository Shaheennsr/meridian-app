"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  getCommunityData,
  getMessages,
  respondToFriendRequest,
  searchUsers,
  sendFriendRequest,
  sendMessage,
} from "@/lib/actions/community";

type Person = { id: string; name: string; email: string };
type SearchResult = Person & { status: "friends" | "requested" | "incoming" | "none" };
type ChatMessage = { id: string; body: string; createdAt: string; fromMe: boolean };

export function CommunityClient({
  friends: initialFriends,
  incomingRequests: initialRequests,
}: {
  friends: Person[];
  incomingRequests: { id: string; sender: Person }[];
}) {
  const [friends, setFriends] = useState(initialFriends);
  const [incomingRequests, setIncomingRequests] = useState(initialRequests);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFriend, setActiveFriend] = useState<Person | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const refreshCommunity = async () => {
    const data = await getCommunityData();
    setFriends(data.friends);
    setIncomingRequests(data.incomingRequests);
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      const res = await searchUsers(trimmed);
      setResults(res);
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!activeFriend) return;
    let cancelled = false;

    const load = async () => {
      const msgs = await getMessages(activeFriend.id);
      if (!cancelled) setMessages(msgs);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activeFriend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendRequest = (userId: string) => {
    startTransition(async () => {
      await sendFriendRequest(userId);
      const res = await searchUsers(query.trim());
      setResults(res);
      refreshCommunity();
    });
  };

  const handleRespond = (requestId: string, accept: boolean) => {
    startTransition(async () => {
      await respondToFriendRequest(requestId, accept);
      refreshCommunity();
    });
  };

  const handleSend = () => {
    const body = draft.trim();
    if (!body || !activeFriend) return;
    setDraft("");
    setMessages((prev) => [
      ...prev,
      { id: `optimistic-${Date.now()}`, body, createdAt: new Date().toISOString(), fromMe: true },
    ]);
    startTransition(async () => {
      await sendMessage(activeFriend.id, body);
      const msgs = await getMessages(activeFriend.id);
      setMessages(msgs);
    });
  };

  return (
    <main className="flex flex-1 overflow-hidden">
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-4">
          <h1 className="font-serif text-lg font-semibold text-slate-900">Community</h1>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find students by name or email"
            className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-400"
          />
          {results.length > 0 && (
            <div className="mt-2 flex flex-col gap-1.5">
              {results.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-navy-50 px-3 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-slate-900">{r.name}</div>
                    <div className="truncate text-[11px] text-slate-500">{r.email}</div>
                  </div>
                  {r.status === "none" && (
                    <button
                      onClick={() => handleSendRequest(r.id)}
                      className="ml-2 flex-shrink-0 rounded-md bg-teal-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-teal-700"
                    >
                      Add
                    </button>
                  )}
                  {r.status === "requested" && (
                    <span className="ml-2 flex-shrink-0 text-[11px] text-slate-400">Requested</span>
                  )}
                  {r.status === "incoming" && (
                    <span className="ml-2 flex-shrink-0 text-[11px] text-teal-600">Respond below</span>
                  )}
                  {r.status === "friends" && (
                    <span className="ml-2 flex-shrink-0 text-[11px] text-slate-400">Friends</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {incomingRequests.length > 0 && (
          <div className="border-b border-slate-200 p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Friend Requests
            </div>
            <div className="flex flex-col gap-2">
              {incomingRequests.map((req) => (
                <div key={req.id} className="rounded-lg border border-slate-200 p-2.5">
                  <div className="text-xs font-semibold text-slate-900">{req.sender.name}</div>
                  <div className="text-[11px] text-slate-500">{req.sender.email}</div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      className="flex-1 rounded-md bg-teal-600 py-1 text-[11px] font-semibold text-white hover:bg-teal-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      className="flex-1 rounded-md bg-slate-100 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-2">
          <div className="mb-1 px-2 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Friends
          </div>
          {friends.length === 0 && (
            <p className="px-2 py-3 text-xs text-slate-400">
              No friends yet — search above to send a request.
            </p>
          )}
          {friends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => setActiveFriend(friend)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${
                activeFriend?.id === friend.id ? "bg-navy-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-navy-700 text-xs font-semibold text-white">
                {friend.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-slate-900">{friend.name}</div>
                <div className="truncate text-[11px] text-slate-500">{friend.email}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeFriend ? (
        <div className="flex flex-1 flex-col">
          <div className="border-b border-slate-200 bg-white px-6 py-3.5">
            <div className="text-sm font-semibold text-slate-900">{activeFriend.name}</div>
            <div className="text-[11px] text-slate-500">{activeFriend.email}</div>
          </div>
          <div className="flex-1 overflow-auto px-6 py-4">
            <div className="flex flex-col gap-2.5">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-sm rounded-xl px-3.5 py-2 text-sm ${
                      m.fromMe ? "bg-teal-600 text-white" : "bg-white text-slate-900"
                    }`}
                  >
                    {m.body}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="flex gap-2 border-t border-slate-200 bg-white p-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={`Message ${activeFriend.name}`}
              className="flex-1 rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-teal-400"
            />
            <button
              onClick={handleSend}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <h2 className="font-serif text-lg font-semibold text-slate-900">Select a friend</h2>
            <p className="mt-2 text-sm text-slate-500">
              Search for classmates, send friend requests, and start chatting.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
