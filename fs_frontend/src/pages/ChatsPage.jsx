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
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme as useMuiTheme,
  InputAdornment,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import ForumIcon from "@mui/icons-material/Forum";
import BlockIcon from "@mui/icons-material/Block";
import ReportIcon from "@mui/icons-material/Report";
import ChatIcon from "@mui/icons-material/Chat";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import GavelIcon from "@mui/icons-material/Gavel";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useAppTheme } from "../hooks/useAppTheme";
import { useUser } from "../hooks/useUser";
import { useError } from "../context/ErrorContext";
import { SocketContext } from "../context/SocketContext";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../utils/api";
import useAuthStore from "../store/useAuthStore";
import ConversationListItem from "../components/ConversationListItem";
import ChatMessage from "../components/ChatMessage";
import ChatContextMenu from "../components/ChatContextMenu";
import { SearchIcon } from "lucide-react";

const SIDEBAR_PANEL_WIDTH = 300;
const TOPBAR_HEIGHT = "52px";

export default function ChatsPage() {
  const theme = useAppTheme();
  const { loggedUser } = useUser();
  const setUnreadMessages = useAuthStore((s) => s.setUnreadMessages);
  const { showError } = useError();
  const { socket } = useContext(SocketContext);
  const { state: navigationState } = useLocation();
  const navigate = useNavigate();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const currentUserIsAdmin =
    loggedUser?.role === "ADMIN" || loggedUser?.role === "DEVELOPER";

  const [selectedTab, setSelectedTab] = useState("chats");
  const [conversationList, setConversationList] = useState([]);
  const [openedConversation, setOpenedConversation] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [reportClosedDialog, setReportClosedDialog] = useState(false);
  const [conversationFinishedDialog, setConversationFinishedDialog] =
    useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [hasMoreMessagesToLoad, setHasMoreMessagesToLoad] = useState(true);
  const [messageInputText, setMessageInputText] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [replyTargetMessage, setReplyTargetMessage] = useState(null);
  const [messageBeingEdited, setMessageBeingEdited] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rightClickMenu, setRightClickMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });
  const [blockWarningDialog, setBlockWarningDialog] = useState({
    open: false,
    type: null,
  });
  const [finishInvestigationDialog, setFinishInvestigationDialog] =
    useState(false);
  const [chatOptionsMenuAnchor, setChatOptionsMenuAnchor] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [chatBlockReportDialog, setChatBlockReportDialog] = useState(false);
  const [chatReportMotivo, setChatReportMotivo] = useState("");
  const [chatReportSending, setChatReportSending] = useState(false);
  const [chatOnlyReportDialog, setChatOnlyReportDialog] = useState(false);
  const [chatOnlyReportMotivo, setChatOnlyReportMotivo] = useState("");
  const [chatOnlyReportSending, setChatOnlyReportSending] = useState(false);
  const [unreadByChat, setUnreadByChat] = useState({});

  const bottomOfMessagesRef = useRef(null);
  const topSentinelRef = useRef(null);
  const messageInputRef = useRef(null);
  const filePickerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const processedMessageIds = useRef(new Set());

  const sidebarBg = theme.sidebarBg;
  const chatAreaBg = theme.name === "dark" ? "#1e1e1e" : "#f9f9f9";
  const dividerColor =
    theme.name === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const accentColor = theme.accent || theme.primaryBack;
  const mainTextColor = theme.primaryText;
  const mutedTextColor = theme.mutedText || theme.secondaryText;

  const isAtBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    bottomOfMessagesRef.current?.scrollIntoView({ behavior });
    setHasNewMessage(false);
  }, []);

  const buildConversationList = (rawConnections, currentUserId) => {
    return rawConnections
      .map((connection) => {
        const myHalf = connection.user_connections?.find(
          (uc) => uc.user?.id === currentUserId,
        );
        const friendHalf = connection.user_connections?.find(
          (uc) => uc.user?.id !== currentUserId,
        );
        const isBlocked = connection.status === "BLOCKED";
        const iBlockedThem = isBlocked && myHalf?.blocked_by === currentUserId;
        const friendRole = friendHalf?.user?.role;
        const isReportChat = currentUserIsAdmin && friendRole === "USER";
        return {
          connectionId: connection.id,
          friendUser: friendHalf?.user,
          connectionStatus: connection.status,
          isBlocked,
          iBlockedThem,
          isReportChat,
          lastMessage: connection.messages?.[0] || null,
        };
      })
      .filter((conv) => conv.friendUser);
  };

  const visibleConversations = (
    currentUserIsAdmin
      ? conversationList.filter((c) =>
          selectedTab === "reportes" ? c.isReportChat : !c.isReportChat,
        )
      : conversationList
  )
    .filter((c) =>
      c.friendUser?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      const fechaA = a.lastMessage?.createdAt || a.lastMessage?.created_at || 0;
      const fechaB = b.lastMessage?.createdAt || b.lastMessage?.created_at || 0;
      return new Date(fechaB) - new Date(fechaA);
    });

  const reportChatsCount = conversationList.filter(
    (c) => c.isReportChat,
  ).length;
  const normalChatsCount = conversationList.filter(
    (c) => !c.isReportChat,
  ).length;
  const isCurrentChatBlocked = openedConversation?.isBlocked;

  const unreadChatsTotal = conversationList
    .filter((c) => !c.isReportChat)
    .reduce((acc, c) => acc + (unreadByChat[c.connectionId] || 0), 0);
  const unreadReportesTotal = conversationList
    .filter((c) => c.isReportChat)
    .reduce((acc, c) => acc + (unreadByChat[c.connectionId] || 0), 0);

  useEffect(() => {
    async function loadConversationList() {
      if (!loggedUser) return;
      try {
        const response = await api.get("/connections");
        if (response.data.ok) {
          const builtList = buildConversationList(
            response.data.datos,
            loggedUser.id,
          );
          setConversationList(builtList);

          const unreadMap = {};
          await Promise.all(
            builtList.map(async (c) => {
              try {
                const res = await api.get(`/messages/${c.connectionId}/unread`);
                if (res.data.ok) unreadMap[c.connectionId] = res.data.count;
              } catch (error) {}
            }),
          );
          setUnreadByChat(unreadMap);
          const total = Object.values(unreadMap).reduce((a, b) => a + b, 0);
          setUnreadMessages(total);

          const pendingConnectionId =
            sessionStorage.getItem("openConnectionId");
          if (pendingConnectionId) {
            sessionStorage.removeItem("openConnectionId");
            const targetConversation = builtList.find(
              (c) => c.connectionId === Number(pendingConnectionId),
            );
            if (targetConversation) {
              if (currentUserIsAdmin && targetConversation.isReportChat) {
                setSelectedTab("reportes");
                setTimeout(() => selectConversation(targetConversation), 0);
              } else selectConversation(targetConversation);
            } else setConversationFinishedDialog(true);
          } else if (navigationState?.openConnectionId) {
            const targetConversation = builtList.find(
              (c) => c.connectionId === navigationState.openConnectionId,
            );
            if (targetConversation) {
              if (currentUserIsAdmin && targetConversation.isReportChat) {
                setSelectedTab("reportes");
                setTimeout(() => selectConversation(targetConversation), 0);
              } else selectConversation(targetConversation);
            } else setConversationFinishedDialog(true);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    if (loggedUser) loadConversationList();
  }, [loggedUser]);

  const loadMessages = useCallback(
    async (connectionId, beforeMessageId = null) => {
      setIsLoadingMessages(true);
      try {
        const params = { limit: 30 };
        if (beforeMessageId) params.beforeId = beforeMessageId;
        const response = await api.get(`/messages/${connectionId}`, { params });
        if (response.data.ok) {
          const fetchedMessages = response.data.datos;
          if (beforeMessageId)
            setMessageList((prev) => [...fetchedMessages, ...prev]);
          else {
            setMessageList(fetchedMessages);
            setTimeout(() => bottomOfMessagesRef.current?.scrollIntoView(), 50);
          }
          setHasMoreMessagesToLoad(fetchedMessages.length === 30);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [],
  );

  const updateLastMessage = useCallback(async (connectionId) => {
    try {
      const response = await api.get(`/messages/${connectionId}`, {
        params: { limit: 1 },
      });
      if (response.data.ok && response.data.datos.length > 0) {
        const lastMsg = response.data.datos[0];
        setConversationList((prev) =>
          prev.map((c) =>
            c.connectionId === connectionId
              ? { ...c, lastMessage: lastMsg }
              : c,
          ),
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const markChatAsRead = useCallback(
    async (connectionId) => {
      try {
        await api.put(`/messages/${connectionId}/read`);
        setUnreadByChat((prev) => {
          const prevCount = prev[connectionId] || 0;
          const newMap = { ...prev, [connectionId]: 0 };
          if (prevCount > 0) {
            setUnreadMessages((globalPrev) =>
              Math.max(0, globalPrev - prevCount),
            );
          }
          return newMap;
        });
      } catch (e) {
        console.error(e);
      }
    },
    [setUnreadMessages],
  );

  const selectConversation = (conversation) => {
    if (openedConversation?.connectionId === conversation.connectionId) return;
    if (openedConversation) {
      markChatAsRead(openedConversation.connectionId);
      if (socket) socket.emit("leave_chat", openedConversation.connectionId);
    }
    setOpenedConversation(conversation);
    setMessageList([]);
    setHasMoreMessagesToLoad(true);
    setReplyTargetMessage(null);
    setMessageBeingEdited(null);
    setMessageInputText("");
    loadMessages(conversation.connectionId);
    updateLastMessage(conversation.connectionId);
    markChatAsRead(conversation.connectionId);
    if (socket) socket.emit("join_chat", conversation.connectionId);
  };

  const handleTabChange = (newTab) => {
    setSelectedTab(newTab);
    if (openedConversation) {
      const belongsToNewTab =
        newTab === "reportes"
          ? openedConversation.isReportChat
          : !openedConversation.isReportChat;
      if (!belongsToNewTab) {
        if (socket) socket.emit("leave_chat", openedConversation.connectionId);
        setOpenedConversation(null);
        setMessageList([]);
      }
    }
  };

  const handleFinishInvestigation = async () => {
    try {
      await api.put(`/connections/${openedConversation.connectionId}/finish`);
      setConversationList((prev) =>
        prev.filter((c) => c.connectionId !== openedConversation.connectionId),
      );
      setOpenedConversation(null);
      setMessageList([]);
    } catch (error) {
      showError(
        "No se pudo finalizar la investigación.",
        "Inténtalo de nuevo más tarde.",
      );
    } finally {
      setFinishInvestigationDialog(false);
    }
  };

  const checkIfBlockedBeforeAction = () => {
    if (!openedConversation?.isBlocked) return false;
    if (openedConversation.iBlockedThem)
      setBlockWarningDialog({ open: true, type: "I_BLOCKED_THEM" });
    else setBlockWarningDialog({ open: true, type: "THEY_BLOCKED_ME" });
    return true;
  };

  const handleUnblockAndContinue = async () => {
    try {
      await api.put(`/connections/${openedConversation.connectionId}/activate`);
      const response = await api.get("/connections");
      if (response.data.ok) {
        const builtList = buildConversationList(
          response.data.datos,
          loggedUser.id,
        );
        setConversationList(builtList);
        const updatedConversation = builtList.find(
          (c) => c.connectionId === openedConversation.connectionId,
        );
        if (updatedConversation) setOpenedConversation(updatedConversation);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBlockWarningDialog({ open: false, type: null });
    }
  };

  useEffect(() => {
    if (!socket) return;
    const onInvestigacionFinalizada = ({ connectionId, esReporte }) => {
      setConversationList((prev) =>
        prev.filter((c) => c.connectionId !== connectionId),
      );
      setOpenedConversation((prev) => {
        if (prev?.connectionId === connectionId) {
          setMessageList([]);
          return null;
        }
        return prev;
      });
      if (esReporte) setReportClosedDialog(true);
    };
    const onReporteAceptado = ({ connectionId }) => {
      api
        .get("/connections")
        .then((response) => {
          if (response.data.ok)
            setConversationList(
              buildConversationList(response.data.datos, loggedUser.id),
            );
        })
        .catch(() => {});
    };
    const onIncomingMessage = (payload) => {
      const newMessage = payload.data || payload;
      const connectionId = newMessage.connection_id;

      if (processedMessageIds.current.has(newMessage.id)) return;
      processedMessageIds.current.add(newMessage.id);
      setTimeout(() => processedMessageIds.current.delete(newMessage.id), 5000);

      if (connectionId)
        setConversationList((prev) =>
          prev.map((c) =>
            c.connectionId === connectionId
              ? { ...c, lastMessage: newMessage }
              : c,
          ),
        );

      setOpenedConversation((currentConv) => {
        if (currentConv?.connectionId !== connectionId) {
          if (newMessage.user_id !== loggedUser?.id) {
            setUnreadByChat((prev) => ({
              ...prev,
              [connectionId]: (prev[connectionId] || 0) + 1,
            }));
            setUnreadMessages((prev) => prev + 1);
          }
          return currentConv;
        }
        setMessageList((prev) => {
          if (prev.find((m) => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        if (isAtBottom()) {
          setTimeout(() => scrollToBottom("smooth"), 50);
        } else {
          setHasNewMessage(true);
        }
        return currentConv;
      });
    };
    const onEditedMessage = (payload) => {
      const editedMessage = payload.data || payload;
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === editedMessage.id ? { ...m, ...editedMessage } : m,
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

    socket.on("nuevo_mensaje", onIncomingMessage);
    socket.on("mensaje_editado", onEditedMessage);
    socket.on("mensaje_borrado", onDeletedMessage);
    socket.on("investigacion_finalizada", onInvestigacionFinalizada);
    socket.on("reporte_aceptado", onReporteAceptado);

    const onConexionBloqueada = ({ connectionId, blockedBy }) => {
      const iBlockedThem = blockedBy === loggedUser?.id;
      setConversationList((prev) =>
        prev.map((c) =>
          c.connectionId === connectionId
            ? {
                ...c,
                connectionStatus: "BLOCKED",
                isBlocked: true,
                iBlockedThem,
              }
            : c,
        ),
      );
      setOpenedConversation((prev) =>
        prev?.connectionId === connectionId
          ? {
              ...prev,
              connectionStatus: "BLOCKED",
              isBlocked: true,
              iBlockedThem,
            }
          : prev,
      );
    };
    const onConexionActivada = ({ connectionId }) => {
      setConversationList((prev) =>
        prev.map((c) =>
          c.connectionId === connectionId
            ? {
                ...c,
                connectionStatus: "ACTIVE",
                isBlocked: false,
                iBlockedThem: false,
              }
            : c,
        ),
      );
      setOpenedConversation((prev) =>
        prev?.connectionId === connectionId
          ? {
              ...prev,
              connectionStatus: "ACTIVE",
              isBlocked: false,
              iBlockedThem: false,
            }
          : prev,
      );
    };
    socket.on("conexion_bloqueada", onConexionBloqueada);
    socket.on("conexion_activada", onConexionActivada);

    return () => {
      socket.off("nuevo_mensaje", onIncomingMessage);
      socket.off("mensaje_editado", onEditedMessage);
      socket.off("mensaje_borrado", onDeletedMessage);
      socket.off("investigacion_finalizada", onInvestigacionFinalizada);
      socket.off("reporte_aceptado", onReporteAceptado);
      socket.off("conexion_bloqueada", onConexionBloqueada);
      socket.off("conexion_activada", onConexionActivada);
    };
  }, [socket, loggedUser]);

  useEffect(() => {
    return () => {
      if (socket && openedConversation?.connectionId) {
        socket.emit("leave_chat", openedConversation.connectionId);
      }
    };
  }, [socket, openedConversation]);

  useEffect(() => {
    const unreadByChatRef = { current: {} };
    unreadByChatRef.current = unreadByChat;
    return () => {
      const total = Object.values(unreadByChatRef.current).reduce((a, b) => a + b, 0);
      setUnreadMessages(total);
    };
  }, [unreadByChat]);

  useEffect(() => {
    const topElement = topSentinelRef.current;
    if (!topElement) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMoreMessagesToLoad &&
          !isLoadingMessages &&
          messageList.length > 0
        )
          loadMessages(openedConversation.connectionId, messageList[0].id);
      },
      { threshold: 0.1 },
    );
    observer.observe(topElement);
    return () => observer.disconnect();
  }, [
    hasMoreMessagesToLoad,
    isLoadingMessages,
    messageList,
    openedConversation,
    loadMessages,
  ]);

  const sendTextMessage = async () => {
    if (!messageInputText.trim() || !openedConversation || isSendingMessage)
      return;
    if (checkIfBlockedBeforeAction()) return;
    if (messageBeingEdited) {
      try {
        setIsSendingMessage(true);
        await api.put(`/messages/${messageBeingEdited.id}`, {
          body: messageInputText.trim(),
        });
        setMessageBeingEdited(null);
        setMessageInputText("");
      } catch (error) {
        showError("No se pudo editar el mensaje.", "Inténtalo de nuevo.");
      } finally {
        setIsSendingMessage(false);
      }
      return;
    }
    try {
      setIsSendingMessage(true);
      await api.post(`/messages/${openedConversation.connectionId}/text`, {
        body: messageInputText.trim(),
        reply_id: replyTargetMessage?.id || null,
      });
      setMessageInputText("");
      setReplyTargetMessage(null);
    } catch (error) {
      showError(
        "No se pudo enviar el mensaje.",
        "Comprueba tu conexión e inténtalo de nuevo.",
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  const sendMediaMessage = async (file) => {
    if (!file || !openedConversation) return;
    if (checkIfBlockedBeforeAction()) return;

    const mime = file.type || "";
    const esVideo = mime.startsWith("video/");
    const esAudio = mime.startsWith("audio/");
    const esImagen = mime.startsWith("image/");

    const MAX_VIDEO = 100 * 1024 * 1024;
    const MAX_IMAGEN = 10 * 1024 * 1024;
    const MAX_AUDIO = 100 * 1024 * 1024;
    const MAX_ARCHIVO = 10 * 1024 * 1024;

    if (esVideo && file.size > MAX_VIDEO) {
      setMediaError("Los vídeos no pueden superar los 100 MB.");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }
    if (esImagen && file.size > MAX_IMAGEN) {
      setMediaError("Las imágenes no pueden superar los 10 MB.");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }
    if (esAudio && file.size > MAX_AUDIO) {
      setMediaError("Los audios no pueden superar los 100 MB.");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }
    if (!esVideo && !esImagen && !esAudio && file.size > MAX_ARCHIVO) {
      setMediaError("Los archivos no pueden superar los 10 MB.");
      if (filePickerRef.current) filePickerRef.current.value = "";
      return;
    }

    setMediaError(null);
    setUploadingMedia(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("body", file.name);
    if (replyTargetMessage) formData.append("reply_id", replyTargetMessage.id);
    try {
      await api.post(
        `/messages/${openedConversation.connectionId}/media`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setReplyTargetMessage(null);
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (error) {
      setMediaError("Error al enviar el archivo. Inténtalo de nuevo.");
    } finally {
      setUploadingMedia(false);
      if (filePickerRef.current) filePickerRef.current.value = "";
    }
  };

  const handleChatBlock = async () => {
    if (!openedConversation) return;
    try {
      await api.put(`/connections/${openedConversation.connectionId}/block`);
    } catch (error) {
      showError(
        "No se pudo bloquear al usuario.",
        "Inténtalo de nuevo más tarde.",
      );
    } finally {
      setChatOptionsMenuAnchor(null);
    }
  };

  const handleChatUnblock = async () => {
    if (!openedConversation) return;
    try {
      await api.put(`/connections/${openedConversation.connectionId}/activate`);
    } catch (error) {
      showError(
        "No se pudo desbloquear al usuario.",
        "Inténtalo de nuevo más tarde.",
      );
    } finally {
      setChatOptionsMenuAnchor(null);
    }
  };

  const handleChatBlockAndReport = async () => {
    if (!chatReportMotivo.trim()) return;
    const connectionId = openedConversation.connectionId;
    const friendUserId = openedConversation.friendUser?.id;
    const friendUserName = openedConversation.friendUser?.name;
    const motivo = chatReportMotivo.trim();

    setChatReportSending(true);
    try {
      await api.put(`/connections/${connectionId}/block`);
      await api.post("/requests/report", {
        body: motivo,
        infoReport: {
          type: "USER",
          user_id: friendUserId,
          user_name: friendUserName,
        },
      });
      setChatBlockReportDialog(false);
      setChatReportMotivo("");
    } catch (error) {
      showError(
        "No se pudo bloquear y reportar al usuario.",
        "Inténtalo de nuevo más tarde.",
      );
    } finally {
      setChatReportSending(false);
      setChatOptionsMenuAnchor(null);
    }
  };

  const handleChatOnlyReport = async () => {
    if (!chatOnlyReportMotivo.trim()) return;
    const friendUserId = openedConversation.friendUser?.id;
    const friendUserName = openedConversation.friendUser?.name;
    const motivo = chatOnlyReportMotivo.trim();
    setChatOnlyReportSending(true);
    try {
      await api.post("/requests/report", {
        body: motivo,
        infoReport: {
          type: "USER",
          user_id: friendUserId,
          user_name: friendUserName,
        },
      });
      setChatOnlyReportDialog(false);
      setChatOnlyReportMotivo("");
    } catch (error) {
      showError(
        "No se pudo enviar el reporte.",
        "Inténtalo de nuevo más tarde.",
      );
    } finally {
      setChatOnlyReportSending(false);
    }
  };

  const deleteMessage = async (message) => {
    if (checkIfBlockedBeforeAction()) return;
    try {
      await api.delete(`/messages/${message.id}`);
    } catch (error) {
      showError("No se pudo eliminar el mensaje.", "Inténtalo de nuevo.");
    }
  };

  const openRightClickMenu = (e, message) => {
    e.preventDefault();
    if (message.deleted) return;
    const isMine = messageIsFromMe(message);
    const menuWidth = 160;
    const x = isMine ? e.clientX - menuWidth : e.clientX;
    setRightClickMenu({ visible: true, x, y: e.clientY, message });
  };

  const closeRightClickMenu = () =>
    setRightClickMenu({ visible: false, x: 0, y: 0, message: null });

  const startEditingMessage = (message) => {
    if (checkIfBlockedBeforeAction()) return;
    if (message.type !== "TEXT" || message.user_id !== loggedUser?.id) return;
    setMessageBeingEdited(message);
    setMessageInputText(message.body);
    setReplyTargetMessage(null);
    messageInputRef.current?.focus();
  };

  const startReplyingToMessage = (message) => {
    if (checkIfBlockedBeforeAction()) return;
    setReplyTargetMessage(message);
    setMessageBeingEdited(null);
    messageInputRef.current?.focus();
  };

  const messageIsFromMe = (message) =>
    message.user_id === loggedUser?.id || message.author?.id === loggedUser?.id;

  const handleBackToList = () => {
    if (openedConversation) {
      markChatAsRead(openedConversation.connectionId);
    }
    setOpenedConversation(null);
    setMessageList([]);
  };

  const showList = !isMobile || !openedConversation;
  const showChat = !isMobile || !!openedConversation;

  return (
    <Box
      sx={{
        position: "fixed",
        top: TOPBAR_HEIGHT,
        left: { xs: 0, sm: "68px" },
        right: 0,
        bottom: { xs: "56px", sm: 0 },
        display: "flex",
        overflow: "hidden",
      }}
      onClick={closeRightClickMenu}
    >
      {showList && (
        <Box
          sx={{
            width: isMobile ? "100%" : SIDEBAR_PANEL_WIDTH,
            flexShrink: 0,
            borderRight: isMobile ? "none" : `1px solid ${dividerColor}`,
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {currentUserIsAdmin ? (
            <Box
              sx={{
                display: "flex",
                borderBottom: `1px solid ${dividerColor}`,
                flexShrink: 0,
              }}
            >
              <Box
                onClick={() => handleTabChange("chats")}
                sx={{
                  flex: 1,
                  py: 1.25,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  cursor: "pointer",
                  borderBottom:
                    selectedTab === "chats"
                      ? `2px solid ${accentColor}`
                      : "2px solid transparent",
                  opacity: selectedTab === "chats" ? 1 : 0.5,
                  transition: "all 0.15s",
                  "&:hover": { opacity: 1 },
                }}
              >
                <ChatIcon sx={{ fontSize: 18, color: mainTextColor }} />
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: mainTextColor,
                    }}
                  >
                    Chats
                  </Typography>
                  {unreadChatsTotal > 0 && (
                    <Box
                      sx={{
                        minWidth: 16,
                        height: 16,
                        borderRadius: "8px",
                        background: accentColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        {unreadChatsTotal > 99 ? "99+" : unreadChatsTotal}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box
                onClick={() => handleTabChange("reportes")}
                sx={{
                  flex: 1,
                  py: 1.25,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  cursor: "pointer",
                  borderBottom:
                    selectedTab === "reportes"
                      ? "2px solid #f44336"
                      : "2px solid transparent",
                  opacity: selectedTab === "reportes" ? 1 : 0.5,
                  transition: "all 0.15s",
                  "&:hover": { opacity: 1 },
                }}
              >
                <ReportIcon
                  sx={{
                    fontSize: 18,
                    color:
                      selectedTab === "reportes" ? "#f44336" : mainTextColor,
                  }}
                />
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography
                    sx={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color:
                        selectedTab === "reportes" ? "#f44336" : mainTextColor,
                    }}
                  >
                    Reportes
                  </Typography>
                  {unreadReportesTotal > 0 && (
                    <Box
                      sx={{
                        minWidth: 16,
                        height: 16,
                        borderRadius: "8px",
                        background: "#f44336",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        px: 0.5,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color: "#fff",
                          lineHeight: 1,
                        }}
                      >
                        {unreadReportesTotal > 99 ? "99+" : unreadReportesTotal}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${dividerColor}`,
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: mainTextColor, fontSize: "1rem" }}
              >
                Chats
              </Typography>
            </Box>
          )}
          <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar chat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon
                        sx={{ color: mutedTextColor, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "40px",
                  background: theme.tertiaryBack,
                  borderRadius: "10px",
                  color: mainTextColor,
                  fontSize: "0.85rem",
                  "& fieldset": {
                    border: `1px solid ${accentColor}25`,
                  },
                  "&:hover fieldset": {
                    borderColor: `${accentColor}50`,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: accentColor,
                    borderWidth: "1.5px",
                  },
                },
              }}
            />
          </Box>
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
            {visibleConversations.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ color: mutedTextColor, fontSize: "0.85rem" }}>
                  {selectedTab === "reportes"
                    ? "No hay chats de reporte"
                    : "No hay chats"}
                </Typography>
              </Box>
            ) : (
              visibleConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.connectionId}
                  conversation={{
                    ...conversation,
                    friend: conversation.friendUser,
                    last_message: conversation.lastMessage,
                    blockedByMe: conversation.iBlockedThem,
                  }}
                  isActive={
                    openedConversation?.connectionId ===
                    conversation.connectionId
                  }
                  onSelect={selectConversation}
                  unreadCount={unreadByChat[conversation.connectionId] || 0}
                />
              ))
            )}
          </Box>
        </Box>
      )}

      {showChat &&
        (!openedConversation ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: chatAreaBg,
            }}
          >
            <Box sx={{ textAlign: "center", opacity: 0.35 }}>
              {selectedTab === "reportes" ? (
                <ReportIcon sx={{ fontSize: 52, color: "#f44336", mb: 1.5 }} />
              ) : (
                <ForumIcon
                  sx={{ fontSize: 52, color: mainTextColor, mb: 1.5 }}
                />
              )}
              <Typography
                sx={{ color: mainTextColor, fontWeight: 600, mb: 0.5 }}
              >
                Selecciona un chat
              </Typography>
              <Typography sx={{ color: mutedTextColor, fontSize: "0.85rem" }}>
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
              background: chatAreaBg,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: `1px solid ${dividerColor}`,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
                flexShrink: 0,
              }}
            >
              {isMobile && (
                <IconButton
                  size="small"
                  onClick={handleBackToList}
                  sx={{
                    color: mutedTextColor,
                    "&:hover": { color: mainTextColor },
                  }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Avatar
                src={
                  openedConversation.friendUser?.url_image ||
                  "/no_user_avatar_image.png"
                }
                sx={{
                  width: 34,
                  height: 34,
                  filter: isCurrentChatBlocked ? "grayscale(100%)" : "none",
                  opacity: isCurrentChatBlocked ? 0.6 : 1,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={0.75}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: mainTextColor,
                      lineHeight: 1.2,
                    }}
                  >
                    {openedConversation.friendUser?.name}
                  </Typography>
                  {openedConversation.isReportChat && (
                    <ReportIcon sx={{ fontSize: 14, color: "#f44336" }} />
                  )}
                </Box>
                {isCurrentChatBlocked && (
                  <Typography sx={{ fontSize: "0.7rem", color: "#f44336" }}>
                    {openedConversation.iBlockedThem
                      ? "Usuario bloqueado"
                      : "No disponible"}
                  </Typography>
                )}
                {openedConversation.isReportChat && !isCurrentChatBlocked && (
                  <Typography sx={{ fontSize: "0.7rem", color: "#f44336" }}>
                    Chat de investigación
                  </Typography>
                )}
              </Box>
              {currentUserIsAdmin && openedConversation.isReportChat && (
                <Tooltip title="Cerrar este caso de investigación">
                  <Button
                    onClick={() => setFinishInvestigationDialog(true)}
                    size="small"
                    startIcon={<GavelIcon fontSize="small" />}
                    sx={{
                      background: "rgba(244,67,54,0.1)",
                      color: "#f44336",
                      border: "1px solid rgba(244,67,54,0.3)",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      px: 1.5,
                      flexShrink: 0,
                      "&:hover": { background: "rgba(244,67,54,0.2)" },
                    }}
                  >
                    Finalizar
                  </Button>
                </Tooltip>
              )}
              <Tooltip title="Opciones">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setChatOptionsMenuAnchor(e.currentTarget);
                  }}
                  sx={{
                    color: mutedTextColor,
                    "&:hover": { color: mainTextColor },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={chatOptionsMenuAnchor}
                open={Boolean(chatOptionsMenuAnchor)}
                onClose={() => setChatOptionsMenuAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    borderRadius: "12px",
                    background:
                      theme.name === "dark" ? "#2c2c2c" : theme.primaryBack,
                    border: `1px solid ${dividerColor}`,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    minWidth: 180,
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setChatOptionsMenuAnchor(null);
                    navigate("/app/" + openedConversation.friendUser?.id);
                  }}
                  sx={{ color: mainTextColor, fontSize: "0.875rem", py: 1.25 }}
                >
                  Ver perfil
                </MenuItem>

                {(() => {
                  const myRole = loggedUser?.role;
                  const friendRole = openedConversation.friendUser?.role;
                  const isBlocked = openedConversation.isBlocked;
                  const iBlockedThem = openedConversation.iBlockedThem;
                  const isReport = openedConversation.isReportChat;

                  if (myRole === "USER") {
                    if (
                      isReport ||
                      friendRole === "ADMIN" ||
                      friendRole === "DEVELOPER"
                    )
                      return null; // chat con otro USER
                    if (isBlocked && iBlockedThem)
                      return [
                        <MenuItem
                          key="unblock"
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            handleChatUnblock();
                          }}
                          sx={{
                            color: mainTextColor,
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Desbloquear
                        </MenuItem>,
                        <MenuItem
                          key="report"
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            setChatOnlyReportDialog(true);
                          }}
                          sx={{
                            color: "#f44336",
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Reportar
                        </MenuItem>,
                      ];
                    if (!isBlocked)
                      return [
                        <MenuItem
                          key="block"
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            handleChatBlock();
                          }}
                          sx={{
                            color: mainTextColor,
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Bloquear
                        </MenuItem>,
                        <MenuItem
                          key="report"
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            setChatOnlyReportDialog(true);
                          }}
                          sx={{
                            color: "#f44336",
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Reportar
                        </MenuItem>,
                        <MenuItem
                          key="block-report"
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            setChatBlockReportDialog(true);
                          }}
                          sx={{
                            color: "#f44336",
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Bloquear y reportar
                        </MenuItem>,
                      ];
                    return null;
                  }

                  // SOY ADMIN — chat con ADMIN (normal) o chat con USER (reporte)
                  if (myRole === "ADMIN") {
                    if (isReport) return null; // reporte con user: solo ver perfil
                    if (friendRole === "DEVELOPER") return null; // con dev: solo ver perfil
                    // chat con otro ADMIN
                    if (isBlocked && iBlockedThem)
                      return (
                        <MenuItem
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            handleChatUnblock();
                          }}
                          sx={{
                            color: mainTextColor,
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Desbloquear
                        </MenuItem>
                      );
                    if (!isBlocked)
                      return (
                        <MenuItem
                          onClick={() => {
                            setChatOptionsMenuAnchor(null);
                            handleChatBlock();
                          }}
                          sx={{
                            color: mainTextColor,
                            fontSize: "0.875rem",
                            py: 1.25,
                          }}
                        >
                          Bloquear
                        </MenuItem>
                      );
                    return null;
                  }

                  // SOY DEVELOPER — solo ver perfil siempre
                  return null;
                })()}
              </Menu>
            </Box>

            <Box
              ref={messagesContainerRef}
              onScroll={() => {
                if (isAtBottom()) setHasNewMessage(false);
              }}
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 2,
                py: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                opacity: isCurrentChatBlocked ? 0.5 : 1,
                "&::-webkit-scrollbar": { width: 3 },
                "&::-webkit-scrollbar-thumb": {
                  background: accentColor,
                  borderRadius: 4,
                },
              }}
            >
              <Box ref={topSentinelRef} sx={{ height: 1 }} />
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
                  isMine={messageIsFromMe(message)}
                  friendAvatarUrl={openedConversation.friendUser?.url_image}
                  onContextMenu={openRightClickMenu}
                  onReplyClick={(parentId) => {
                    const el = document.getElementById(`msg-${parentId}`);
                    if (el) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      el.style.transition = "background 0.4s";
                      el.style.background = `${accentColor}30`;
                      setTimeout(() => {
                        el.style.background = "";
                      }, 1000);
                    } else {
                      alert(
                        "No se pudo encontrar el mensaje al que estás respondiendo. Prueba a cargar más mensajes.",
                      );
                    }
                  }}
                />
              ))}
              <Box ref={bottomOfMessagesRef} />
            </Box>

            {/* Burbuja de carga al subir media */}
            {uploadingMedia && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 80,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
                  border: `1px solid ${dividerColor}`,
                  borderRadius: "20px",
                  px: 2,
                  py: 0.75,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  zIndex: 10,
                }}
              >
                <CircularProgress size={14} sx={{ color: accentColor }} />
                <Typography sx={{ fontSize: "0.8rem", color: mutedTextColor }}>
                  Subiendo archivo...
                </Typography>
              </Box>
            )}

            {/* Indicador ↓ Nuevo mensaje */}
            {hasNewMessage && (
              <Box
                onClick={() => scrollToBottom("smooth")}
                sx={{
                  position: "absolute",
                  bottom: 80,
                  right: 16,
                  background: accentColor,
                  color: "#fff",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.5,
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  zIndex: 10,
                  userSelect: "none",
                  "&:hover": { opacity: 0.9 },
                }}
              >
                ↓ Nuevo mensaje
              </Box>
            )}

            {/* Banner de error de archivo */}
            {mediaError && (
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  background: "#f4433615",
                  borderTop: `1px solid #f4433640`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ fontSize: "0.8rem", color: "#f44336" }}>
                  {mediaError}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setMediaError(null)}
                  sx={{ color: "#f44336" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {(replyTargetMessage || messageBeingEdited) && (
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
                  borderTop: `1px solid ${dividerColor}`,
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
                      color: theme.secondaryText,
                      mb: 0.25,
                    }}
                  >
                    {messageBeingEdited
                      ? "Editando mensaje"
                      : `Respondiendo a ${replyTargetMessage?.author?.name}`}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: mainTextColor,
                      opacity: 0.8,
                    }}
                    noWrap
                  >
                    {messageBeingEdited
                      ? messageBeingEdited.body
                      : replyTargetMessage?.body || "Archivo multimedia"}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    setReplyTargetMessage(null);
                    setMessageBeingEdited(null);
                    setMessageInputText("");
                  }}
                  sx={{ color: mutedTextColor }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderTop: `1px solid ${dividerColor}`,
                background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
              }}
            >
              {!messageBeingEdited && (
                <>
                  <input
                    ref={filePickerRef}
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files[0])
                        sendMediaMessage(e.target.files[0]);
                    }}
                  />
                  <Tooltip title="Adjuntar archivo">
                    <IconButton
                      size="small"
                      onClick={() => filePickerRef.current?.click()}
                      sx={{
                        color: mutedTextColor,
                        "&:hover": { color: accentColor },
                      }}
                    >
                      <AttachFileIcon
                        fontSize="small "
                        sx={{ color: mainTextColor }}
                      />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <TextField
                inputRef={messageInputRef}
                fullWidth
                multiline
                maxRows={4}
                placeholder={
                  isCurrentChatBlocked
                    ? "Conversación no disponible"
                    : "Escribe un mensaje..."
                }
                value={messageInputText}
                onChange={(e) => setMessageInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendTextMessage();
                  }
                }}
                onClick={() => {
                  if (isCurrentChatBlocked) checkIfBlockedBeforeAction();
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    background: chatAreaBg,
                    "& fieldset": {
                      borderColor: isCurrentChatBlocked
                        ? "#f4433640"
                        : `${accentColor}40`,
                    },
                    "&:hover fieldset": {
                      borderColor: isCurrentChatBlocked
                        ? "#f44336"
                        : accentColor,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: isCurrentChatBlocked
                        ? "#f44336"
                        : accentColor,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: isCurrentChatBlocked
                      ? mutedTextColor
                      : mainTextColor,
                    fontSize: "0.875rem",
                    cursor: isCurrentChatBlocked ? "not-allowed" : "text",
                  },
                }}
              />
              <Tooltip
                title={messageBeingEdited ? "Guardar cambios" : "Enviar"}
              >
                <span>
                  <IconButton
                    onClick={sendTextMessage}
                    disabled={!messageInputText.trim() || isSendingMessage}
                    sx={{
                      background: messageInputText.trim()
                        ? `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`
                        : "transparent",
                      color: messageInputText.trim() ? "#fff" : mutedTextColor,
                      borderRadius: "12px",
                      width: 40,
                      height: 40,
                      "&:hover": { opacity: 0.85 },
                      "&.Mui-disabled": { background: "transparent" },
                    }}
                  >
                    {messageBeingEdited ? (
                      <DoneIcon fontSize="small" />
                    ) : (
                      <SendIcon
                        fontSize="small"
                        sx={{ color: mainTextColor }}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>
        ))}

      {rightClickMenu.visible && rightClickMenu.message && (
        <ChatContextMenu
          x={rightClickMenu.x}
          y={rightClickMenu.y}
          message={rightClickMenu.message}
          isMine={messageIsFromMe(rightClickMenu.message)}
          onReply={startReplyingToMessage}
          onEdit={startEditingMessage}
          onDelete={deleteMessage}
          onClose={closeRightClickMenu}
        />
      )}

      <Dialog
        open={chatOnlyReportDialog}
        onClose={() => {
          setChatOnlyReportDialog(false);
          setChatOnlyReportMotivo("");
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 360 },
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReportIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Reportar usuario
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: mutedTextColor, fontSize: "0.875rem", mb: 2 }}
          >
            Indica el motivo del reporte. El asunto es obligatorio.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe el motivo..."
            value={chatOnlyReportMotivo}
            onChange={(e) => setChatOnlyReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                color: mainTextColor,
                "& fieldset": { borderColor: `${accentColor}40` },
                "&:hover fieldset": { borderColor: accentColor },
                "&.Mui-focused fieldset": { borderColor: accentColor },
              },
              "& .MuiInputBase-input": { fontSize: "0.875rem" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setChatOnlyReportDialog(false);
              setChatOnlyReportMotivo("");
            }}
            sx={{
              color: mutedTextColor,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChatOnlyReport}
            disabled={!chatOnlyReportMotivo.trim() || chatOnlyReportSending}
            variant="contained"
            sx={{
              background: "#f44336",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { background: "#c62828" },
              "&.Mui-disabled": { background: "#f4433640", color: "#fff8" },
            }}
          >
            {chatOnlyReportSending ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Enviar reporte"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={chatBlockReportDialog}
        onClose={() => {
          setChatBlockReportDialog(false);
          setChatReportMotivo("");
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 360 },
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReportIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Bloquear y reportar
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: mutedTextColor, fontSize: "0.875rem", mb: 2 }}
          >
            Indica el motivo del reporte. El asunto es obligatorio.
          </DialogContentText>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Describe el motivo..."
            value={chatReportMotivo}
            onChange={(e) => setChatReportMotivo(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                color: mainTextColor,
                "& fieldset": { borderColor: `${accentColor}40` },
                "&:hover fieldset": { borderColor: accentColor },
                "&.Mui-focused fieldset": { borderColor: accentColor },
              },
              "& .MuiInputBase-input": { fontSize: "0.875rem" },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setChatBlockReportDialog(false);
              setChatReportMotivo("");
            }}
            sx={{
              color: mutedTextColor,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleChatBlockAndReport}
            disabled={!chatReportMotivo.trim() || chatReportSending}
            variant="contained"
            sx={{
              background: "#f44336",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { background: "#c62828" },
              "&.Mui-disabled": { background: "#f4433640", color: "#fff8" },
            }}
          >
            {chatReportSending ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              "Bloquear y reportar"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={finishInvestigationDialog}
        onClose={() => setFinishInvestigationDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 320 },
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <GavelIcon sx={{ color: "#f44336", fontSize: 20 }} />
            Finalizar investigación
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: mutedTextColor, fontSize: "0.875rem" }}
          >
            ¿Estás seguro de que quieres cerrar este caso? El chat quedará
            deshabilitado y el usuario no podrá enviar más mensajes en esta
            conversación.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setFinishInvestigationDialog(false)}
            sx={{
              color: mutedTextColor,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFinishInvestigation}
            variant="contained"
            sx={{
              background: "#f44336",
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              "&:hover": { background: "#c62828" },
            }}
          >
            Finalizar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={conversationFinishedDialog}
        onClose={() => {
          navigate(location.pathname, { replace: true, state: null });
          setConversationFinishedDialog(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 320 },
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pt: 3 }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
          >
            <LockIcon sx={{ color: mutedTextColor, fontSize: 20 }} />
            Conversación cerrada
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: mutedTextColor,
              fontSize: "0.875rem",
              lineHeight: 1.7,
            }}
          >
            Esta conversación ha sido cerrada y ya no está disponible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button
            onClick={() => {
              navigate(location.pathname, { replace: true, state: null });
              setConversationFinishedDialog(false);
            }}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`,
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              px: 3,
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={blockWarningDialog.open}
        onClose={() => setBlockWarningDialog({ open: false, type: null })}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 320 },
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <BlockIcon sx={{ color: "#f44336", fontSize: 20 }} />
            {blockWarningDialog.type === "I_BLOCKED_THEM"
              ? "Usuario bloqueado"
              : "Acción no disponible"}
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ color: mutedTextColor, fontSize: "0.875rem" }}
          >
            {blockWarningDialog.type === "I_BLOCKED_THEM"
              ? `Para realizar esta acción necesitas desbloquear a ${openedConversation?.friendUser?.name} primero. ¿Quieres desbloquearlo ahora?`
              : "No ha sido posible completar tu acción en esta conversación."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setBlockWarningDialog({ open: false, type: null })}
            sx={{
              color: mutedTextColor,
              textTransform: "none",
              borderRadius: "8px",
            }}
          >
            Cancelar
          </Button>
          {blockWarningDialog.type === "I_BLOCKED_THEM" && (
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
          {blockWarningDialog.type === "THEY_BLOCKED_ME" && (
            <Button
              onClick={() => setBlockWarningDialog({ open: false, type: null })}
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

      <Dialog
        open={reportClosedDialog}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            background: theme.name === "dark" ? "#2c2c2c" : sidebarBg,
            border: `1px solid ${dividerColor}`,
            minWidth: { xs: "90vw", sm: 340 },
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ color: mainTextColor, fontWeight: 700, pt: 3 }}>
          Investigación finalizada
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              color: mutedTextColor,
              fontSize: "0.875rem",
              lineHeight: 1.7,
            }}
          >
            Se ha finalizado tu reporte. No olvides volver a acudir a nuestra
            administración ante un mal comportamiento que incumpla nuestras
            normas. ¡Gracias!
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button
            onClick={() => setReportClosedDialog(false)}
            variant="contained"
            sx={{
              background: `linear-gradient(135deg, ${accentColor}, ${theme.variantBack})`,
              color: "#fff",
              textTransform: "none",
              borderRadius: "8px",
              fontWeight: 600,
              px: 3,
            }}
          >
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}