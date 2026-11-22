import { toast } from "sonner";

/**
 * Centralized API error handler.
 * Logs the error and shows a sonner toast with a user-friendly message.
 * Components can use this in catch blocks for consistent error feedback.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = "An error occurred"
): void {
  const message = error instanceof Error ? error.message : fallbackMessage;
  toast.error(message);
  console.error("API error:", error);
}
