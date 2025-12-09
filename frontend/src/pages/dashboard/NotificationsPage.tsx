import { useEffect, useState, useMemo } from "react";
import { Bell, Check, Loader2, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import type { Notification, NotificationsPayload } from "@/types";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await notificationsApi.getNotifications();
      if (res.success && res.data) {
        const payload = res.data as NotificationsPayload;
        setNotifications(payload.notifications || []);
      } else {
        toast.error(res.message || "Failed to load notifications");
      }
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        toast.error(
          (error as { message?: string }).message ||
            "Failed to load notifications"
        );
      } else {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const handleMarkAsRead = async (id: number) => {
    try {
      setMarking(true);
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      );
    } catch {
      toast.error("Failed to mark as read");
    } finally {
      setMarking(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarking(true);
      await notificationsApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) =>
          n.is_read
            ? n
            : { ...n, is_read: true, read_at: new Date().toISOString() }
        )
      );
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarking(false);
    }
  };

  const goToRelated = (n: Notification) => {
    if (n.related_bid) {
      navigate(`/dashboard/bids/${n.related_bid}`);
    } else if (n.related_offer) {
      navigate(`/dashboard/bids/${n.related_bid ?? ""}`);
    } else if (n.related_payment) {
      navigate(`/dashboard/payments`);
    } else if (n.related_document) {
      navigate(`/dashboard/settings`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay up to date on bids, offers, payments, and verification.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAll}
            disabled={marking || unreadCount === 0}
            className="flex items-center gap-2"
          >
            {marking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Mark all as read
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Inbox className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No notifications
          </h3>
          <p className="text-gray-600 text-sm">You're all caught up.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg space-y-1 overflow-hidden">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 flex items-start gap-3 border-b border-gray-200 last:border-b-0 ${
                n.is_read ? "bg-white" : "bg-blue-50/60"
              }`}
            >
              <div className="mt-1">
                <Bell
                  className={`w-5 h-5 ${
                    n.is_read ? "text-gray-400" : "text-blue-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">{n.title}</p>
                  {!n.is_read && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={n.is_read || marking}
                    onClick={() => handleMarkAsRead(n.id)}
                  >
                    Mark as read
                  </Button>
                  {(n.related_bid ||
                    n.related_payment ||
                    n.related_offer ||
                    n.related_document) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => goToRelated(n)}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
