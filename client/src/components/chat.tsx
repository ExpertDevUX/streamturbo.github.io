import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Shield } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface ChatProps {
  streamId: string;
}

export default function Chat({ streamId }: ChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat", streamId],
    enabled: !!streamId,
    retry: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      await apiRequest("POST", "/api/chat/send", {
        streamId,
        message: messageText,
      });
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/chat", streamId] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    // Set up WebSocket connection for real-time chat
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("Chat WebSocket connected");
      // Join chat room
      websocket.send(JSON.stringify({
        type: "join_chat",
        streamId,
        userId: user?.id,
      }));
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message" && data.streamId === streamId) {
        // Refresh chat messages
        queryClient.invalidateQueries({ queryKey: ["/api/chat", streamId] });
      }
    };

    websocket.onclose = () => {
      console.log("Chat WebSocket disconnected");
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [streamId, user?.id, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-4 border-b border-elevated">
        <h3 className="font-semibold text-white">Stream Chat</h3>
        <p className="text-sm text-gray-400">
          {messages.length > 0 ? `${messages.length} messages` : "No messages yet"}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{maxHeight: "calc(100vh - 200px)"}}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start space-x-2">
              <Avatar className="w-6 h-6 flex-shrink-0">
                <AvatarImage src={msg.user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {msg.user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    msg.isModerator ? "text-primary" : "text-white"
                  }`}>
                    {msg.user?.username || "Anonymous"}
                  </span>
                  {msg.isModerator && (
                    <Shield className="w-3 h-3 text-success" />
                  )}
                  <span className="text-xs text-gray-400">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-300 break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <p>No messages yet</p>
            <p className="text-sm">Be the first to chat!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-elevated">
        {user ? (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Say something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sendMessageMutation.isPending}
              className="flex-1 bg-elevated border-elevated text-white placeholder-gray-400 text-sm"
            />
            <Button
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-primary hover:bg-purple-700"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center text-gray-400 text-sm">
            <p>Sign in to join the chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
