import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ForumIcon from "@mui/icons-material/Forum";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import ChatIcon from "@mui/icons-material/Chat";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import { SocketContext } from "../context/SocketContext";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import ConversationListItem from "../components/ConversationListItem";
import ChatMessage from "../components/ChatMessage";
import ChatContextMenu from "../components/ChatContextMenu";

const CONVERSATION_PANEL_WIDTH = 300;
const NAVBAR_HEIGHT = "52px";

export default function ChatsPage() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const { socket } = useContext(SocketContext);
  const { state: navigationState } = useLocation();

  const isAdmin =
    loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";

  const [activeView, setActiveView] = useState("chats");
  const [allConversations, setAllConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });
  const [blockDialog, setBlockDialog] = useState({ open: false, type: null });

  const messagesBottomRef = useRef(null);
  const messagesTopSentinelRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const sidebarBackground = theme.secondaryBack;
  const chatAreaBackground = theme.tertiaryBack;
  const borderColor =
    theme.name === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const accentColor = theme.primaryBack;
  const primaryTextColor = theme.primaryText;
  const subtleTextColor = theme.secondaryText;

  const mapConversations = (datos, currentUserId) => {
    return datos
      .map((connection) => {
        const myUserConnection = connection.user_connections?.find(
          (uc) => uc.user?.id === currentUserId,
        );
        const friendUserConnection = connection.user_connections?.find(
          (uc) => uc.user?.id !== currentUserId,
        );
        const isBlocked = connection.status === "BLOCKED";
        const blockedByMe =
          isBlocked && myUserConnection?.blocked_by === currentUserId;
        const friendRole = friendUserConnection?.user?.role;
        const isReport = isAdmin && friendRole === "USER";

        return {
          connectionId: connection.id,
          friend: friendUserConnection?.user,
          status: connection.status,
          isBlocked,
          blockedByMe,
          isReport,
          last_message: null,
        };
      })
      .filter((conv) => conv.friend);
  };

  const conversationList = isAdmin
    ? allConversations.filter((c) =>
        activeView === "reportes" ? c.isReport : !c.isReport,
      )
    : allConversations;

  // Carga el último mensaje de una conversación y actualiza la lista
  const loadLastMessage = useCallback(async (connectionId) => {
    try {
      const res = await api.get(`/messages/${connectionId}`, {
        params: { limit: 1 },
      });
      if (res.data.ok && res.data.datos.length > 0) {
        const lastMsg = res.data.datos[0];
        setAllConversations((prev) =>
          prev.map((c) =>
            c.connectionId === connectionId
              ? { ...c, last_message: lastMsg }
              : c,
          ),
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    async function fetchConversationList() {
      if (!loggedUser) return;
      try {
        const res = await api.get("/connections");
        if (res.data.ok) {
          const mapped = mapConversations(res.data.datos, loggedUser.id);
          setAllConversations(mapped);

          // Cargamos el último mensaje de cada conversación de forma independiente
          mapped.forEach((conv) => loadLastMessage(conv.connectionId));

          const pendingId = sessionStorage.getItem("openConnectionId");
          if (pendingId) {
            sessionStorage.removeItem("openConnectionId");
            const target = mapped.find(
              (c) => c.connectionId === Number(pendingId),
            );
            if (target) {
              if (isAdmin && target.isReport) setActiveView("reportes");
              openConversation(target);
            }
          } else if (navigationState?.openConnectionId) {
            const target = mapped.find(
              (c) => c.connectionId === navigationState.openConnectionId,
            );
            if (target) {
              if (isAdmin && target.isReport) setActiveView("reportes");
              openConversation(target);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (loggedUser) fetchConversationList();
  }, [loggedUser]);

  const fetchMessages = useCallback(async (connectionId, beforeId = null) => {
    setIsLoadingMessages(true);
    try {
      const queryParams = { limit: 30 };
      if (beforeId) queryParams.beforeId = beforeId;
      const res = await api.get(`/messages/${connectionId}`, {
        params: queryParams,
      });
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const openConversation = (conversation) => {
    if (activeConversation?.connectionId === conversation.connectionId) return;
    if (activeConversation && socket)
      socket.emit("leave_chat", activeConversation.connectionId);
    setActiveConversation(conversation);
    setMessageList([]);
    setHasMoreMessages(true);
    setReplyToMessage(null);
    setEditingMessage(null);
    setMessageText("");
    fetchMessages(conversation.connectionId);
    if (socket) socket.emit("join_chat", conversation.connectionId);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    if (activeConversation) {
      const pertenece =
        view === "reportes"
          ? activeConversation.isReport
          : !activeConversation.isReport;
      if (!pertenece) {
        if (socket) socket.emit("leave_chat", activeConversation.connectionId);
        setActiveConversation(null);
        setMessageList([]);
      }
    }
  };

  const checkBlockedAction = () => {
    if (!activeConversation?.isBlocked) return false;
    if (activeConversation.blockedByMe) {
      setBlockDialog({ open: true, type: "BLOCKED_BY_ME" });
    } else {
      setBlockDialog({ open: true, type: "BLOCKED_BY_THEM" });
    }
    return true;
  };

  const handleUnblockAndContinue = async () => {
    try {
      await api.put(`/connections/${activeConversation.connectionId}/activate`);
      const res = await api.get("/connections");
      if (res.data.ok) {
        const mapped = mapConversations(res.data.datos, loggedUser.id);
        setAllConversations(mapped);
        mapped.forEach((conv) => loadLastMessage(conv.connectionId));
        const updated = mapped.find(
          (c) => c.connectionId === activeConversation.connectionId,
        );
        if (updated) setActiveConversation(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBlockDialog({ open: false, type: null });
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onNewMessage = (payload) => {
      const incomingMessage = payload.data || payload;
      setMessageList((prev) => {
        if (prev.find((m) => m.id === incomingMessage.id)) return prev;
        return [...prev, incomingMessage];
      });
      setTimeout(
        () => messagesBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );

      // Actualizar el último mensaje en la lista lateral
      const connId = incomingMessage.connection_id;
      if (connId) {
        setAllConversations((prev) =>
          prev.map((c) =>
            c.connectionId === connId
              ? { ...c, last_message: incomingMessage }
              : c,
          ),
        );
      }
    };

    const onEditedMessage = (payload) => {
      const updatedMessage = payload.data || payload;
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m,
        ),
      );
    };

    const onDeletedMessage = ({ messageId }) => {
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deleted: true, body: null, url: null }
            : m,
        ),
      );
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreMessages &&
          !isLoadingMessages &&
          messageList.length > 0
        ) {
          fetchMessages(activeConversation.connectionId, messageList[0].id);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [
    hasMoreMessages,
    isLoadingMessages,
    messageList,
    activeConversation,
    fetchMessages,
  ]);

  const sendTextMessage = async () => {
    if (!messageText.trim() || !activeConversation || isSending) return;
    if (checkBlockedAction()) return;
    if (editingMessage) {
      try {
        setIsSending(true);
        await api.put(`/messages/${editingMessage.id}`, {
          body: messageText.trim(),
        });
        setEditingMessage(null);
        setMessageText("");
      } catch (error) {
        console.error(error);
      } finally {
        setIsSending(false);
      }
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const sendMediaMessage = async (file) => {
    if (!file || !activeConversation) return;
    if (checkBlockedAction()) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("body", file.name);
    if (replyToMessage) formData.append("reply_id", replyToMessage.id);
    try {
      await api.post(
        `/messages/${activeConversation.connectionId}/media`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setReplyToMessage(null);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteMessage = async (message) => {
    if (checkBlockedAction()) return;
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const openContextMenu = (e, message) => {
    e.preventDefault();
    if (message.deleted) return;
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, message });
  };

  const closeContextMenu = () =>
    setContextMenu({ visible: false, x: 0, y: 0, message: null });

  const startEditingMessage = (message) => {
    if (checkBlockedAction()) return;
    if (message.type !== "TEXT" || message.user_id !== loggedUser?.id) return;
    setEditingMessage(message);
    setMessageText(message.body);
    setReplyToMessage(null);
    textInputRef.current?.focus();
  };

  const startReplyingToMessage = (message) => {
    if (checkBlockedAction()) return;
    setReplyToMessage(message);
    setEditingMessage(null);
    textInputRef.current?.focus();
  };

  const isMyMessage = (message) =>
    message.user_id === loggedUser?.id || message.author?.id === loggedUser?.id;

  const isActiveConversationBlocked = activeConversation?.isBlocked;
  const reportesCount = allConversations.filter((c) => c.isReport).length;
  const chatsCount = allConversations.filter((c) => !c.isReport).length;

  return (
    <Box
      sx={{
        position: "fixed",
        top: NAVBAR_HEIGHT,
        left: "68px",
        right: 0,
        bottom: 0,
        display: "flex",
        overflow: "hidden",
      }}
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
          overflow: "hidden",
        }}
      >
        {isAdmin ? (
          <Box
            sx={{
              display: "flex",
              borderBottom: `1px solid ${borderColor}`,
              flexShrink: 0,
            }}
          >
            <Box
              onClick={() => handleViewChange("chats")}
              sx={{
                flex: 1,
                py: 1.25,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.25,
                cursor: "pointer",
                borderBottom:
                  activeView === "chats"
                    ? `2px solid ${accentColor}`
                    : "2px solid transparent",
                opacity: activeView === "chats" ? 1 : 0.5,
                transition: "all 0.15s",
                "&:hover": { opacity: 1 },
              }}
            >
              <ChatIcon sx={{ fontSize: 18, color: primaryTextColor }} />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: primaryTextColor,
                }}
              >
                Chats {chatsCount > 0 && `(${chatsCount})`}
              </Typography>
            </Box>
            <Box
              onClick={() => handleViewChange("reportes")}
              sx={{
                flex: 1,
                py: 1.25,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.25,
                cursor: "pointer",
                borderBottom:
                  activeView === "reportes"
                    ? "2px solid #f44336"
                    : "2px solid transparent",
                opacity: activeView === "reportes" ? 1 : 0.5,
                transition: "all 0.15s",
                "&:hover": { opacity: 1 },
              }}
            >
              <ReportIcon
                sx={{
                  fontSize: 18,
                  color:
                    activeView === "reportes" ? "#f44336" : primaryTextColor,
                }}
              />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color:
                    activeView === "reportes" ? "#f44336" : primaryTextColor,
                }}
              >
                Reportes {reportesCount > 0 && `(${reportesCount})`}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${borderColor}`,
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: primaryTextColor,
                fontSize: "1rem",
              }}
            >
              Chats
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 3 },
            "&::-webkit-scrollbar-thumb": {
              background: accentColor,
              borderRadius: 4,
            },
          }}
        >
          {conversationList.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: subtleTextColor, fontSize: "0.85rem" }}>
                {activeView === "reportes"
                  ? "No tienes chats de reporte"
                  : "Aún no tienes chats"}
              </Typography>
            </Box>
          ) : (
            conversationList.map((conversation) => (
              <ConversationListItem
                key={conversation.connectionId}
                conversation={conversation}
                isActive={
                  activeConversation?.connectionId === conversation.connectionId
                }
                onSelect={openConversation}
              />
            ))
          )}
        </Box>
      </Box>

      {!activeConversation ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: chatAreaBackground,
          }}
        >
          <Box sx={{ textAlign: "center", opacity: 0.35 }}>
            {activeView === "reportes" ? (
              <ReportIcon sx={{ fontSize: 52, color: "#f44336", mb: 1.5 }} />
            ) : (
              <ForumIcon
                sx={{ fontSize: 52, color: primaryTextColor, mb: 1.5 }}
              />
            )}
            <Typography
              sx={{ color: primaryTextColor, fontWeight: 600, mb: 0.5 }}
            >
              Selecciona un chat
            </Typography>
            <Typography sx={{ color: subtleTextColor, fontSize: "0.85rem" }}>
              Elige una conversación de la lista
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: chatAreaBackground,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              background: sidebarBackground,
              flexShrink: 0,
            }}
          >
            <Avatar
              src={
                activeConversation.friend?.url_image ||
                "/no_user_avatar_image.png"
              }
              sx={{
                width: 34,
                height: 34,
                filter: isActiveConversationBlocked
                  ? "grayscale(100%)"
                  : "none",
                opacity: isActiveConversationBlocked ? 0.6 : 1,
              }}
            />
            <Box>
              <Box display="flex" alignItems="center" gap={0.75}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: primaryTextColor,
                    lineHeight: 1.2,
                  }}
                >
                  {activeConversation.friend?.name}
                </Typography>
                {activeConversation.isReport && (
                  <ReportIcon sx={{ fontSize: 14, color: "#f44336" }} />
                )}
              </Box>
              {isActiveConversationBlocked && (
                <Typography sx={{ fontSize: "0.7rem", color: "#f44336" }}>
                  {activeConversation.blockedByMe
                    ? "Usuario bloqueado"
                    : "No disponible"}
                </Typography>
              )}
              {activeConversation.isReport && !isActiveConversationBlocked && (
                <Typography sx={{ fontSize: "0.7rem", color: "#f44336" }}>
                  Chat de investigación
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              opacity: isActiveConversationBlocked ? 0.5 : 1,
              "&::-webkit-scrollbar": { width: 3 },
              "&::-webkit-scrollbar-thumb": {
                background: accentColor,
                borderRadius: 4,
              },
            }}
          >
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
            <Box
              sx={{
                px: 2,
                py: 0.75,
                background: sidebarBackground,
                borderTop: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  px: 1.5,
                  py: 0.75,
                  borderLeft: `3px solid ${accentColor}`,
                  borderRadius: "6px",
                  background: `${accentColor}12`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: accentColor,
                    mb: 0.25,
                  }}
                >
                  {editingMessage
                    ? "Editando mensaje"
                    : `Respondiendo a ${replyToMessage?.author?.name}`}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.78rem",
                    color: primaryTextColor,
                    opacity: 0.8,
                  }}
                  noWrap
                >
                  {editingMessage
                    ? editingMessage.body
                    : replyToMessage?.body || "Archivo multimedia"}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => {
                  setReplyToMessage(null);
                  setEditingMessage(null);
                  setMessageText("");
                }}
                sx={{ color: subtleTextColor }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          <Box
            sx={{
              px: 2,
              py: 1.25,
              borderTop: `1px solid ${borderColor}`,
              background: sidebarBackground,
              display: "flex",
              alignItems: "flex-end",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {!editingMessage && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files[0]) sendMediaMessage(e.target.files[0]);
                  }}
                />
                <Tooltip title="Adjuntar archivo">
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      color: subtleTextColor,
                      "&:hover": { color: accentColor },
                    }}
                  >
                    <AttachFileIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <TextField
              inputRef={textInputRef}
              fullWidth
              multiline
              maxRows={4}
              placeholder={
                isActiveConversationBlocked
                  ? "Conversación no disponible"
                  : "Escribe un mensaje..."
              }
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendTextMessage();
                }
              }}
              onClick={() => {
                if (isActiveConversationBlocked) checkBlockedAction();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  background: chatAreaBackground,
                  "& fieldset": {
                    borderColor: isActiveConversationBlocked
                      ? "#f4433640"
                      : `${accentColor}40`,
                  },
                  "&:hover fieldset": {
                    borderColor: isActiveConversationBlocked
                      ? "#f44336"
                      : accentColor,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: isActiveConversationBlocked
                      ? "#f44336"
                      : accentColor,
                  },
                },
                "& .MuiInputBase-input": {
                  color: isActiveConversationBlocked
                    ? subtleTextColor
                    : primaryTextColor,
                  fontSize: "0.875rem",
                  cursor: isActiveConversationBlocked ? "not-allowed" : "text",
                },
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
                    width: 40,
                    height: 40,
                    "&:hover": { opacity: 0.85 },
                    "&.Mui-disabled": { background: "transparent" },
                  }}
                >
                  {editingMessage ? (
                    <DoneIcon fontSize="small" />
                  ) : (
                    <SendIcon fontSize="small" />
                  )}
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

      <Dialog
        open={blockDialog.open}
        onClose={() => setBlockDialog({ open: false, type: null })}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: sidebarBackground,
            border: `1px solid ${borderColor}`,
            minWidth: 320,
          },
        }}
      >
        <DialogTitle sx={{ color: primaryTextColor, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <BlockIcon sx={{ color: "#f44336", fontSize: 20 }} />
            {blockDialog.type === "BLOCKED_BY_ME"
              ? "Usuario bloqueado"
              : "Acción no disponible"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: subtleTextColor, fontSize: "0.875rem" }}
          >
            {blockDialog.type === "BLOCKED_BY_ME"
              ? `Para realizar esta acción necesitas desbloquear a ${activeConversation?.friend?.name} primero. ¿Quieres desbloquearlo ahora?`
              : "No ha sido posible completar tu acción en esta conversación."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setBlockDialog({ open: false, type: null })}
            sx={{
              color: subtleTextColor,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          {blockDialog.type === "BLOCKED_BY_ME" && (
            <Button
              onClick={handleUnblockAndContinue}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`,
                color: "#fff",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Desbloquear
            </Button>
          )}
          {blockDialog.type === "BLOCKED_BY_THEM" && (
            <Button
              onClick={() => setBlockDialog({ open: false, type: null })}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`,
                color: "#fff",
                textTransform: "none",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Entendido
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
