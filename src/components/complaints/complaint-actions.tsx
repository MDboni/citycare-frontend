"use client";

import { cn } from "cn";
import {
  CircleCheckBigIcon,
  Loader2Icon,
  RotateCcwIcon,
  StarIcon,
  ThumbsUpIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  useCancelComplaint,
  useChangeComplaintStatus,
  useComplaintFeedback,
  useReopenComplaint,
  useUpvoteComplaint,
} from "@/hooks";
import { errorMessage } from "@/lib/api-error";
import { allowedTransitions } from "@/lib/constants";
import type { ComplaintDetail, Role } from "@/types";

/**
 * Every move a citizen can make on their own complaint.
 *
 * Which buttons appear comes from the same transition map the server enforces,
 * so the UI does not offer a move that would come back as a 409. The server is
 * still the authority: a race with an officer loses here and says so.
 */
export function ComplaintActions({
  complaint,
  role,
  isOwner,
}: {
  complaint: ComplaintDetail;
  role: Role;
  isOwner: boolean;
}) {
  const upvote = useUpvoteComplaint(complaint.id);
  const cancel = useCancelComplaint(complaint.id);
  const reopen = useReopenComplaint(complaint.id);
  const close = useChangeComplaintStatus(complaint.id);

  const transitions = allowedTransitions(complaint.status, role);
  const canCancel = isOwner && transitions.includes("CANCELLED");
  const canReopen = isOwner && transitions.includes("REOPENED");
  const canClose = transitions.includes("CLOSED");
  const canRate =
    isOwner &&
    !complaint.feedback &&
    (complaint.status === "RESOLVED" || complaint.status === "CLOSED");
  // A citizen cannot upvote their own report; the server enforces that too.
  const canUpvote = role === "CITIZEN" && !isOwner;

  const [noteDialog, setNoteDialog] = useState<"cancel" | "reopen" | null>(
    null,
  );
  const [note, setNote] = useState("");

  const runNoteAction = async () => {
    const action = noteDialog;
    if (!action) return;

    const trimmed = note.trim();
    const body = trimmed.length >= 2 ? { note: trimmed } : {};

    try {
      if (action === "cancel") {
        await cancel.mutateAsync(body);
        toast.success("Complaint cancelled.");
      } else {
        await reopen.mutateAsync(body);
        toast.success("Complaint reopened. An admin will reassign it.");
      }
      setNoteDialog(null);
      setNote("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const nothingToDo =
    !canUpvote && !canCancel && !canReopen && !canClose && !canRate;

  if (nothingToDo) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canUpvote && (
          <Button
            variant="outline"
            size="sm"
            disabled={upvote.isPending}
            onClick={async () => {
              try {
                const result = await upvote.mutateAsync(undefined);
                toast.success(
                  `Upvoted. ${result.upvoteCount} people have backed this.`,
                );
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          >
            {upvote.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <ThumbsUpIcon />
            )}
            Upvote
            <span className="text-muted-foreground">
              {complaint.upvoteCount}
            </span>
          </Button>
        )}

        {canClose && (
          <Button
            size="sm"
            disabled={close.isPending}
            onClick={async () => {
              try {
                await close.mutateAsync({ status: "CLOSED" });
                toast.success("Closed. Thanks for confirming.");
              } catch (error) {
                toast.error(errorMessage(error));
              }
            }}
          >
            {close.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CircleCheckBigIcon />
            )}
            Accept and close
          </Button>
        )}

        {canReopen && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNoteDialog("reopen")}
          >
            <RotateCcwIcon />
            Reopen
          </Button>
        )}

        {canRate && <FeedbackDialog complaintId={complaint.id} />}

        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setNoteDialog("cancel")}
          >
            <XCircleIcon />
            Cancel complaint
          </Button>
        )}
      </div>

      <Dialog
        open={noteDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setNoteDialog(null);
            setNote("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {noteDialog === "cancel"
                ? "Cancel this complaint?"
                : "Reopen this complaint?"}
            </DialogTitle>
            <DialogDescription>
              {noteDialog === "cancel"
                ? "It stops being worked on. The tracking id keeps working, and the timeline keeps the record."
                : "Say what is still wrong. An admin will reassign it, and the reopen counts against the limit for this complaint."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <FieldLabel htmlFor="action-note">
              Reason {noteDialog === "reopen" ? "" : "(optional)"}
            </FieldLabel>
            <Textarea
              id="action-note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={
                noteDialog === "cancel"
                  ? "It has already been fixed."
                  : "The light works but the pole is still leaning."
              }
            />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>
              Keep it
            </DialogClose>
            <Button
              variant={noteDialog === "cancel" ? "destructive" : "default"}
              disabled={cancel.isPending || reopen.isPending}
              onClick={() => void runNoteAction()}
            >
              {(cancel.isPending || reopen.isPending) && (
                <Loader2Icon className="animate-spin" />
              )}
              {noteDialog === "cancel"
                ? "Cancel complaint"
                : "Reopen complaint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** One rating, one comment, once per complaint — the server rejects a second. */
function FeedbackDialog({ complaintId }: { complaintId: string }) {
  const feedback = useComplaintFeedback(complaintId);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const submit = async () => {
    if (rating < 1) {
      toast.error("Pick a rating from 1 to 5.");
      return;
    }
    try {
      await feedback.mutateAsync({
        rating,
        ...(comment.trim() ? { comment: comment.trim() } : {}),
      });
      toast.success("Thanks — that feedback reaches the department.");
      setOpen(false);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const shown = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <StarIcon />
        Rate the fix
      </Button>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How did that go?</DialogTitle>
          <DialogDescription>
            Ratings roll up into the SLA report each department sees.
          </DialogDescription>
        </DialogHeader>

        {/* A fieldset, so the row is a real group rather than a div wearing a
            role. The hover preview resets on each star rather than on the
            container, which keeps every handler on a focusable control. */}
        <fieldset className="flex items-center gap-1 border-0 p-0">
          <legend className="sr-only">Rating</legend>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} out of 5`}
              aria-pressed={rating === value}
              className="rounded p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              onFocus={() => setHovered(value)}
              onBlur={() => setHovered(0)}
              onClick={() => setRating(value)}
            >
              <StarIcon
                className={cn(
                  "size-6 transition-colors",
                  value <= shown
                    ? "fill-warning text-warning"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
        </fieldset>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="feedback-comment">Comment (optional)</FieldLabel>
          <Textarea
            id="feedback-comment"
            rows={3}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Fixed within two days and the crew cleaned up after themselves."
          />
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Not now</DialogClose>
          <Button disabled={feedback.isPending} onClick={() => void submit()}>
            {feedback.isPending && <Loader2Icon className="animate-spin" />}
            Send feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
