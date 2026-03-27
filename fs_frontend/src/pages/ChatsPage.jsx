import React, { useState, useEffect, useRef, useContext, useCallback } from "react";
import {
  Box, Typography, Avatar, IconButton, TextField,
  Tooltip, CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ForumIcon from "@mui/icons-material/Forum";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import { SocketContext } from "../context/SocketContext";
import api from "../utils/api";
import ConversationListItem from "../components/ConversationListItem";
import ChatMessage from "../components/ChatMessage";
import ChatContextMenu from "../components/ChatContextMenu";

const CONVERSATION_PANEL_WIDTH = 280;
const NAVBAR_HEIGHT = "95px";

export default function ChatsPage() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);

  const [conversationList, setConversationList] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, message: null });

  const messagesBottomRef = useRef(null);
  const messagesTopSentinelRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const sidebarBackground = theme.secondaryBack;
  const chatAreaBackground = theme.tertiaryBack;
  const borderColor = theme.name === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const accentColor = theme.primaryBack;
  const primaryTextColor = theme.primaryText;
  const subtleTextColor = theme.secondaryText;

  useEffect(() => {
    async function fetchConversationList() {
      if (!loggedUser) return;
      try {
        const res = await api.get("/connections");
        if (res.data.ok) {
          const mappedConversations = res.data.datos.map((connection) => {
            const friendUser = connection.user_connections?.find(
              (uc) => uc.user?.id !== loggedUser?.id
            )?.user;
            return { connectionId: connection.id, friend: friendUser, status: connection.status };
          }).filter((conv) => conv.friend);
          setConversationList(mappedConversations);
        }
      } catch (error) { console.error(error); }
    }
    if (loggedUser) fetchConversationList();
  }, [loggedUser]);

  const fetchMessages = useCallback(async (connectionId, beforeId = null) => {
    setIsLoadingMessages(true);
    try {
      const queryParams = { limit: 30 };
      if (beforeId) queryParams.beforeId = beforeId;
      const res = await api.get(`/messages/${connectionId}`, { params: queryParams });
      if (res.data.ok) {
        const fetchedMessages = res.data.datos;
        if (beforeId) {
          setMessageList((prev) => [...fetchedMessages, ...prev]);
        } else {
          setMessageList(fetchedMessages);
          setTimeout(() => messagesBottomRef.current?.scrollIntoView(), 50);
        }
        setHasMoreMessages(fetchedMessages.length === 30);
      }
    } catch (error) { console.error(error); }
    finally { setIsLoadingMessages(false); }
  }, []);

  const openConversation = (conversation) => {
    if (activeConversation?.connectionId === conversation.connectionId) return;
    if (activeConversation && socket) socket.emit("leave_chat", activeConversation.connectionId);
    setActiveConversation(conversation);
    setMessageList([]);
    setHasMoreMessages(true);
    setReplyToMessage(null);
    setEditingMessage(null);
    setMessageText("");
    fetchMessages(conversation.connectionId);
    if (socket) socket.emit("join_chat", conversation.connectionId);
  };

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload) => {
      const incomingMessage = payload.data || payload;
      setMessageList((prev) => {
        if (prev.find((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
      setTimeout(() => messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    };

    const onEditedMessage = (payload) => {
      const updatedMessage = payload.data || payload;
      setMessageList((prev) => prev.map((m) => m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m));
    };

    const onDeletedMessage = ({ messageId }) => {
      setMessageList((prev) => prev.map((m) =>
        m.id === messageId ? { ...m, deleted: true, body: null, url: null } : m
      ));
    };

    socket.on("nuevo_mensaje", onNewMessage);
    socket.on("mensaje_editado", onEditedMessage);
    socket.on("mensaje_borrado", onDeletedMessage);

    return () => {
      socket.off("nuevo_mensaje", onNewMessage);
      socket.off("mensaje_editado", onEditedMessage);
      socket.off("mensaje_borrado", onDeletedMessage);
    };
  }, [socket]);

  useEffect(() => {
    const sentinelElement = messagesTopSentinelRef.current;
    if (!sentinelElement) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMoreMessages && !isLoadingMessages && messageList.length > 0) {
        fetchMessages(activeConversation.connectionId, messageList[0].id);
      }
    }, { threshold: 0.1 });
    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [hasMoreMessages, isLoadingMessages, messageList, activeConversation, fetchMessages]);

  const sendTextMessage = async () => {
    if (!messageText.trim() || !activeConversation || isSending) return;

    if (editingMessage) {
      try {
        setIsSending(true);
        await api.put(`/messages/${editingMessage.id}`, { body: messageText.trim() });
        setEditingMessage(null);
        setMessageText("");
      } catch (error) { console.error(error); }
      finally { setIsSending(false); }
      return;
    }

    try {
      setIsSending(true);
      await api.post(`/messages/${activeConversation.connectionId}/text`, {
        body: messageText.trim(),
        reply_id: replyToMessage?.id || null,
      });
      setMessageText("");
      setReplyToMessage(null);
    } catch (error) { console.error(error); }
    finally { setIsSending(false); }
  };

  const sendMediaMessage = async (file) => {
    if (!file || !activeConversation) return;
    const formData = new FormData();
    formData.append("file", file);
    if (replyToMessage) formData.append("reply_id", replyToMessage.id);
    try {
      await api.post(`/messages/${activeConversation.connectionId}/media`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setReplyToMessage(null);
    } catch (error) { console.error(error); }
  };

  const deleteMessage = async (message) => {
    try { await api.delete(`/messages/${message.id}`); }
    catch (error) { console.error(error); }
  };

  const openContextMenu = (e, message) => {
    e.preventDefault();
    if (message.deleted) return;
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message });
  };

  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, message: null });

  const startEditingMessage = (message) => {
    if (message.type !== "TEXT" || message.user_id !== loggedUser?.id) return;
    setEditingMessage(message);
    setMessageText(message.body);
    setReplyToMessage(null);
    textInputRef.current?.focus();
  };

  const startReplyingToMessage = (message) => {
    setReplyToMessage(message);
    setEditingMessage(null);
    textInputRef.current?.focus();
  };

  const isMyMessage = (message) =>
    message.user_id === loggedUser?.id || message.author?.id === loggedUser?.id;

  return (
    <Box
      sx={{ position: "fixed", top: NAVBAR_HEIGHT, left: 0, right: 0, bottom: 0, display: "flex", overflow: "hidden" }}
      onClick={closeContextMenu}
    >
      <Box
        sx={{
          width: CONVERSATION_PANEL_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${borderColor}`,
          background: sidebarBackground,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 3 },
          "&::-webkit-scrollbar-thumb": { background: accentColor, borderRadius: 4 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <Typography sx={{ fontWeight: 700, color: primaryTextColor, fontSize: "1rem" }}>
            Chats
          </Typography>
        </Box>

        {conversationList.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography sx={{ color: subtleTextColor, fontSize: "0.85rem" }}>
              Aún no tienes amigos con quién chatear
            </Typography>
          </Box>
        ) : (
          conversationList.map((conversation) => (
            <ConversationListItem
              key={conversation.connectionId}
              conversation={conversation}
              isActive={activeConversation?.connectionId === conversation.connectionId}
              onSelect={openConversation}
            />
          ))
        )}
      </Box>

      {!activeConversation ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: chatAreaBackground }}>
          <Box sx={{ textAlign: "center", opacity: 0.35 }}>
            <ForumIcon sx={{ fontSize: 52, color: primaryTextColor, mb: 1.5 }} />
            <Typography sx={{ color: primaryTextColor, fontWeight: 600, mb: 0.5 }}>Selecciona un chat</Typography>
            <Typography sx={{ color: subtleTextColor, fontSize: "0.85rem" }}>
              Elige una conversación de la lista
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", background: chatAreaBackground, overflow: "hidden" }}>

          <Box sx={{
            px: 2, py: 1.25,
            borderBottom: `1px solid ${borderColor}`,
            display: "flex", alignItems: "center", gap: 1.5,
            background: sidebarBackground, flexShrink: 0,
          }}>
            <Avatar src={activeConversation.friend?.url_image || "/no_user_avatar_image.png"} sx={{ width: 34, height: 34 }} />
            <Typography sx={{ fontWeight: 700, color: primaryTextColor }}>
              {activeConversation.friend?.name}
            </Typography>
          </Box>

          <Box sx={{
            flex: 1, overflowY: "auto", px: 2, py: 1.5,
            display: "flex", flexDirection: "column", gap: 0.5,
            "&::-webkit-scrollbar": { width: 3 },
            "&::-webkit-scrollbar-thumb": { background: accentColor, borderRadius: 4 },
          }}>
            <Box ref={messagesTopSentinelRef} sx={{ height: 1 }} />

            {isLoadingMessages && messageList.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} sx={{ color: accentColor }} />
              </Box>
            )}
            {isLoadingMessages && messageList.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={16} sx={{ color: accentColor }} />
              </Box>
            )}

            {messageList.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isMine={isMyMessage(message)}
                friendAvatarUrl={activeConversation.friend?.url_image}
                onContextMenu={openContextMenu}
              />
            ))}

            <Box ref={messagesBottomRef} />
          </Box>

          {(replyToMessage || editingMessage) && (
            <Box sx={{
              px: 2, py: 0.75, background: sidebarBackground,
              borderTop: `1px solid ${borderColor}`,
              display: "flex", alignItems: "center", gap: 1, flexShrink: 0,
            }}>
              <Box sx={{
                flex: 1, px: 1.5, py: 0.75,
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: "6px",
                background: `${accentColor}12`,
              }}>
                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: accentColor, mb: 0.25 }}>
                  {editingMessage ? "Editando mensaje" : `Respondiendo a ${replyToMessage?.author?.name}`}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: primaryTextColor, opacity: 0.8 }} noWrap>
                  {editingMessage ? editingMessage.body : (replyToMessage?.body || "Archivo multimedia")}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => { setReplyToMessage(null); setEditingMessage(null); setMessageText(""); }}
                sx={{ color: subtleTextColor }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box sx={{
            px: 2, py: 1.25,
            borderTop: `1px solid ${borderColor}`,
            background: sidebarBackground,
            display: "flex", alignItems: "flex-end", gap: 1, flexShrink: 0,
          }}>
            {!editingMessage && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
                  style={{ display: "none" }}
                  onChange={(e) => { if (e.target.files[0]) sendMediaMessage(e.target.files[0]); }}
                />
                <Tooltip title="Adjuntar archivo">
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ color: subtleTextColor, "&:hover": { color: accentColor } }}
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <TextField
              inputRef={textInputRef}
              fullWidth multiline maxRows={4}
              placeholder="Escribe un mensaje..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTextMessage(); }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  background: chatAreaBackground,
                  "& fieldset": { borderColor: `${accentColor}40` },
                  "&:hover fieldset": { borderColor: accentColor },
                  "&.Mui-focused fieldset": { borderColor: accentColor },
                },
                "& .MuiInputBase-input": { color: primaryTextColor, fontSize: "0.875rem" },
              }}
            />

            <Tooltip title={editingMessage ? "Guardar cambios" : "Enviar"}>
              <span>
                <IconButton
                  onClick={sendTextMessage}
                  disabled={!messageText.trim() || isSending}
                  sx={{
                    background: messageText.trim()
                      ? `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`
                      : "transparent",
                    color: messageText.trim() ? "#fff" : subtleTextColor,
                    borderRadius: "12px",
                    width: 40, height: 40,
                    "&:hover": { opacity: 0.85 },
                    "&.Mui-disabled": { background: "transparent" },
                  }}
                >
                  {editingMessage ? <DoneIcon fontSize="small" /> : <SendIcon fontSize="small" />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      )}

      {contextMenu.visible && contextMenu.message && (
        <ChatContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
          isMine={isMyMessage(contextMenu.message)}
          onReply={startReplyingToMessage}
          onEdit={startEditingMessage}
          onDelete={deleteMessage}
          onClose={closeContextMenu}
        />
      )}
    </Box>
  );
}
